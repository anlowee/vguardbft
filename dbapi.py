import sqlite3


class CargoDB:
    def __init__(self) -> None:
        self.conn = sqlite3.connect("vguard.db")
        c = self.conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS cargo
            ([CargoType] TEXT, [CargoAmount] INTEGER, [FromAddr] TEXT, [ToAddr] TEXT, [ETA] TEXT, [IsBooked] INTEGER,
            PRIMARY KEY(Cargotype,FromAddr,ToAddr,ETA,IsBooked))
            """
        )
        self.conn.commit()
        self.db_c = c

    def save_entity(self, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked):
        try:
            CargoAmount = int(CargoAmount)
        except:
            print("Illegal input of the cargo amount!")
            raise ValueError

        sentence = " INSERT INTO cargo (CargoType, CargoAmount,FromAddr,ToAddr,ETA,IsBooked) VALUES ('{}',{},'{}','{}','{}','{}')".format(
            CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked
        )
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Item already exists!")

    def delete_entity(self, CargoType):
        sentence = "DELETE FROM cargo WHERE CargoType='{}' ".format(CargoType)
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Item does not exist.")

    def query(self, CargoType):
        sentence = "SELECT * FROM cargo WHERE CargoType='{}'".format(CargoType)
        try:
            self.db_c.execute(sentence)
            query_results = self.db_c.fetchall()
        except:
            print("Item does not exist!")
        return query_results[0]

    def close(self):
        self.conn.close()
        self.conn = None
        self.c = None


if __name__ == "__main__":
    db = CargoDB()
    db.save_entity("Corn", "1", "123", "456", "12-12-12", "Yes")
    db.save_entity("Meat", "1", "123", "456", "12-12-12", "Yes")
    db.delete_entity("Meat")
    print(db.query("Corn"))
