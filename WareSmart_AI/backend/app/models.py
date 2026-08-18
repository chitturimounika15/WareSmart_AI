from sqlalchemy import Column,Integer,String,Float,ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
class Product(Base):
 __tablename__='products'; id=Column(Integer,primary_key=True); sku=Column(String,unique=True); name=Column(String); category=Column(String); stock=Column(Integer); reserved=Column(Integer); reorder=Column(Integer); zone=Column(String)
class Order(Base):
 __tablename__='orders'; id=Column(Integer,primary_key=True); number=Column(String,unique=True); customer=Column(String); delivery=Column(String); sla=Column(Float); value=Column(Float); priority=Column(String,default='Normal'); score=Column(Integer,default=0); status=Column(String,default='Created'); items=relationship('Item',cascade='all,delete-orphan')
class Item(Base):
 __tablename__='items'; id=Column(Integer,primary_key=True); order_id=Column(Integer,ForeignKey('orders.id')); product_id=Column(Integer,ForeignKey('products.id')); qty=Column(Integer); allocated=Column(Integer,default=0); product=relationship('Product')
class ExceptionItem(Base):
 __tablename__='exceptions'; id=Column(Integer,primary_key=True); order_number=Column(String); type=Column(String); severity=Column(String); description=Column(String); recommendation=Column(String); status=Column(String,default='Open')
