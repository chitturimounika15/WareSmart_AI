from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker
engine=create_engine('sqlite:///./warehouse.db',connect_args={'check_same_thread':False})
SessionLocal=sessionmaker(bind=engine,autocommit=False,autoflush=False)
Base=declarative_base()
def db():
 d=SessionLocal()
 try: yield d
 finally: d.close()
