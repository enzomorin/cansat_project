from sqlmodel import SQLModel, Session, Field, create_engine, select

#---- Model ----
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    age: int
    email: str

#---- creat DB ----
engine = create_engine("sqlite:///database/src/mydatabase.db")
SQLModel.metadata.create_all(engine)


#---- Insert (in raw SQL) ----
with Session(engine) as session:
    session.add(User(name="Alice", age=25, email="alice@example.com"))
    session.add(User(name="Bob", age=30, email="bob@example.com"))
    session.commit()

#---- Query or Select (in raw SQL) -> look at some rows or filter them ----
with Session(engine) as session:
    for user in session.exec(select(User)):
        print(user)

#---- Update (in raw SQL) ----
with Session(engine) as session:
    user = session.get(User, 1)
    if user:
        user.age = 26
        session.add(user)
        session.commit()

#---- Delete (in raw SQL) ----
with Session(engine) as session:
    user = session.get(User, 2)
    if user:
        session.delete(user)
        session.commit()