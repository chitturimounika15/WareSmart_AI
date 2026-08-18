from fastapi import FastAPI,Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .database import Base,engine,db
from .models import Product,Order,Item,ExceptionItem
from .engine import prioritize,allocate,reorders,zones
from .ai import ask
Base.metadata.create_all(engine); app=FastAPI(title='WareSmart AI')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],allow_methods=['*'],allow_headers=['*'])
class Status(BaseModel): status:str
class Copilot(BaseModel): message:str
class WhatIf(BaseModel): product_id:int; incoming:int
def pd(p):return {'id':p.id,'sku':p.sku,'name':p.name,'category':p.category,'stock':p.stock,'reserved':p.reserved,'available':max(0,p.stock-p.reserved),'reorder':p.reorder,'zone':p.zone}
def od(o):return {'id':o.id,'number':o.number,'customer':o.customer,'delivery':o.delivery,'sla':o.sla,'value':o.value,'priority':o.priority,'score':o.score,'status':o.status,'items':[{'product':i.product.name,'qty':i.qty,'allocated':i.allocated,'product_id':i.product_id} for i in o.items]}
@app.get('/api/dashboard')
def dashboard(d:Session=Depends(db)):
 ps=[pd(p) for p in d.query(Product)]; os=[od(o) for o in d.query(Order)]; [prioritize(o) for o in d.query(Order)]; d.commit(); low=[p for p in ps if p['available']<=p['reorder']]; delayed=[o for o in os if o['status'] in ['Awaiting Stock','Partially Allocated']]; ex=d.query(ExceptionItem).filter_by(status='Open').count(); health=max(0,min(100,100-len(low)*4-len(delayed)*3-ex*2)); return {'health':health,'inventory':sum(p['stock'] for p in ps),'pending':len(os)-len([o for o in os if o['status']=='Dispatched']),'urgent':len([o for o in os if o['priority'] in ['Critical','High']]),'delayed':len(delayed),'low':len(low),'exceptions':ex,'orders':sorted(os,key=lambda x:x['score'],reverse=True)[:6],'reorders':reorders(d)[:6],'zones':zones(d)}
@app.get('/api/products')
def products(d:Session=Depends(db)):return [pd(p) for p in d.query(Product)]
@app.get('/api/orders')
def orders(d:Session=Depends(db)):
 os=d.query(Order).all();[prioritize(o) for o in os];d.commit();return sorted([od(o) for o in os],key=lambda x:x['score'],reverse=True)
@app.get('/api/exceptions')
def exceptions(d:Session=Depends(db)):return [{'id':e.id,'order':e.order_number,'type':e.type,'severity':e.severity,'description':e.description,'recommendation':e.recommendation} for e in d.query(ExceptionItem)]
@app.post('/api/orders/{oid}/allocate')
def alloc(oid:int,d:Session=Depends(db)):
 o=d.get(Order,oid)
 if not o:raise HTTPException(404,'Order not found')
 return {'decisions':allocate(d,o),'order':od(o)}
@app.post('/api/orders/{oid}/status')
def status(oid:int,p:Status,d:Session=Depends(db)):
 o=d.get(Order,oid)
 if not o:raise HTTPException(404,'Order not found')
 o.status=p.status
 if p.status=='Dispatched':
  for i in o.items:i.product.stock=max(0,i.product.stock-i.allocated);i.product.reserved=max(0,i.product.reserved-i.allocated)
 d.commit();return od(o)
@app.post('/api/copilot')
def copilot(p:Copilot,d:Session=Depends(db)):return {'answer':ask(p.message,{'orders':[od(o) for o in d.query(Order)],'reorders':reorders(d),'zones':zones(d)})}
@app.post('/api/what-if')
def whatif(p:WhatIf,d:Session=Depends(db)):
 x=d.get(Product,p.product_id)
 if not x:raise HTTPException(404,'Product not found')
 a=max(0,x.stock-x.reserved);return {'product':x.name,'current':a,'projected':a+p.incoming,'message':'Prioritize the highest-priority affected orders after replenishment.'}
