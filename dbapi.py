import sqlite3
import os
import queue


class CargoDB:
    def __init__(self) -> None:
        self.conn = sqlite3.connect("vguard.db")
        c = self.conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS cargo
            ([CargoType] TEXT, [CargoAmount] INTEGER, [FromAddr] TEXT, [ToAddr] TEXT, [ETA] TEXT, [IsBooked] INTEGER,
            PRIMARY KEY(Cargotype))
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

    def modify_entity(
        self,
        CargoType,
        CargoAmount=None,
        FromAddr=None,
        ToAddr=None,
        ETA=None,
        IsBooked=None,
    ):
        result = self.query(CargoType)
        self.delete_entity(CargoType)
        CargoAmount = result[1] if CargoAmount is None else CargoAmount
        FromAddr = result[2] if FromAddr is None else FromAddr
        ToAddr = result[3] if ToAddr is None else ToAddr
        ETA = result[4] if ETA is None else ETA
        IsBooked = result[5] if IsBooked is None else IsBooked
        self.save_entity(CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked)

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


class TransactoinDB:
    def __init__(self) -> None:
        self.conn = sqlite3.connect("vguard.db")
        c = self.conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS tx
            ([Tx] TEXT, [CargoType] TEXT,
            PRIMARY KEY(Tx))
            """
        )
        self.conn.commit()
        self.db_c = c
        self.cargo = CargoDB()

    def MoveToPerm(self, tx, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked):
        sentence = " INSERT INTO tx (Tx,CargoType) VALUES ('{}','{}')".format(
            tx, CargoType
        )
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Tx already exists!")
        self.cargo.save_entity(CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked)

    def DeletePerm(self, tx):
        sentence = "SELECT * FROM tx WHERE Tx='{}'".format(tx)
        try:
            self.db_c.execute(sentence)
            query_results = self.db_c.fetchall()
        except:
            print("Tx does not exist!")
        query_results = query_results[0]
        CargoType = query_results[1]
        sentence = "DELETE FROM tx WHERE Tx='{}' ".format(tx)
        self.db_c.execute(sentence)
        self.conn.commit()
        self.cargo.delete_entity(CargoType)


class DB_handler:
    def __init__(self) -> None:
        self.txdb = TransactoinDB()
        self.waitToSumit = queue.Queue()
        self.txdict = {}
        self.last_ts = 0

    def commit(self):
        dirct = "./logs/s0"
        files = os.listdir(dirct)
        for file in files:
            with open(os.path.join(dirct, file), "r") as f:
                lines = f.readlines()
                for line in lines:
                    if 'level=info msg="ts:' in line:
                        prefix = 'level=info msg="ts:'
                        ts = line[line.find(prefix) + len(prefix) : line.find("; tx: ")]
                        ts = float(ts)
                        if ts > self.last_ts:
                            tx = line[line.find("; tx: ") + len("; tx: ") : -2]
                            if self.waitToSumit.empty():
                                break
                            contents = self.waitToSumit.get()
                            self.txdict[contents[0]] = (contents, tx)
                            self.last_ts = ts
                        else:
                            continue

    def add_cargo(self, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked):
        self.waitToSumit.put((CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked))
        self.commit()

    def MoveToPerm(self, CargoType):
        CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked = self.txdict[
            CargoType
        ][0]
        tx = self.txdict[CargoType][1]
        self.txdb.MoveToPerm(
            tx, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked
        )

    def DeletePerm(self, CargoType):
        tx = self.txdict[CargoType][1]
        self.txdb.DeletePerm(tx)


if __name__ == "__main__":
    handler = DB_handler()
    handler.add_cargo("Corn", "1", "123", "456", "12-12-12", "Yes")
    handler.MoveToPerm("Corn")
    handler.DeletePerm("Corn")
