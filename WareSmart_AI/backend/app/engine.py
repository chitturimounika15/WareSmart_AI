from .models import Product, Order

def score(o):
 s=(40 if o.delivery.lower()=='express' else 20)+(25 if o.value>=10000 else 12)+(30 if o.sla<=6 else 18 if o.sla<=12 else 8); return min(100,s)
def label(s): return 'Critical' if s>=85 else 'High' if s>=70 else 'Medium' if s>=50 else 'Normal'
def prioritize(o): o.score=score(o); o.priority=label(o.score); return o
def allocate(db,o):
 prioritize(o); decisions=[]
 for i in o.items:
  avail=max(0,i.product.stock-i.product.reserved); need=i.qty-i.allocated; n=max(0,min(avail,need)); i.allocated+=n; i.product.reserved+=n; decisions.append({'product':i.product.name,'required':i.qty,'allocated_now':n,'remaining':i.qty-i.allocated})
 o.status='Allocated' if all(i.allocated>=i.qty for i in o.items) else 'Partially Allocated' if any(i.allocated for i in o.items) else 'Awaiting Stock'; db.commit(); return decisions
def reorders(db):
 out=[]
 for p in db.query(Product):
  a=max(0,p.stock-p.reserved)
  if a<=p.reorder: out.append({'product_id':p.id,'product':p.name,'available':a,'reorder_level':p.reorder,'recommended_quantity':max(30,p.reorder*3),'status':'Out of Stock' if a==0 else 'Low Stock'})
 return out
def zones(db):
 d={}
 for o in db.query(Order):
  if o.status in ['Created','Awaiting Stock','Partially Allocated','Allocated','Picking']:
   for i in o.items:d[i.product.zone]=d.get(i.product.zone,0)+i.qty
 return [{'zone':z,'workload':w,'capacity':35,'utilization':round(w/35*100),'status':'Critical' if w/35>=1.2 else 'Busy' if w/35>=.85 else 'Healthy'} for z,w in sorted(d.items(),key=lambda x:x[1],reverse=True)]
