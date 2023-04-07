import sqlite3
import datetime

today = datetime.datetime.now().strftime("%x")


class CargoDB:
    def __init__(self) -> None:
        self.conn = sqlite3.connect("vguard.db")
        c = self.conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS cargo
            ([ID] TEXT, [CargoType] TEXT, [CargoAmount] INTEGER, [FromAddr] TEXT, [ToAddr] TEXT, [BoothIndex] INTEGER, [Distance] TEXT, [Progress] TEX, [ETA] TEXT, [IsBooked] INTEGER,
            PRIMARY KEY(ID))
            """
        )
        self.conn.commit()
        self.db_c = c
        try:
            self.db_c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('0','Manure',3000,'Ranch','Farm',1,'0','0','{today}','False')"
            )
            self.db_c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('1','Corn',10000,'Farm','Ranch',2,'0','0','{today}','False')"
            )
            self.db_c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('2','Pineapple',5000,'Farm','Cannery',3,'0','0','{today}','False')"
            )
            self.db_c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('3','Meat',2000,'Ranch','Cannery',4,'0','0','{today}','False')"
            )
            self.conn.commit()
        except:
            pass

    def save_entity(
        self,
        ID: str,
        CargoType: str = "",
        CargoAmount: int = 0,
        FromAddr: str = "",
        ToAddr: str = "",
        BoothIndex: int = 0,
        Distance: float = 0.0,
        Progress: float = 0.0,
        ETA: str = today,
        IsBooked: bool = False,
    ):
        try:
            CargoAmount = int(CargoAmount)
        except:
            print("Illegal input of the cargo amount!")
            raise ValueError
        sentence = " INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('{}','{}',{},'{}','{},'{}','{}','{}','{}','{}')".format(
            ID,
            CargoType,
            CargoAmount,
            FromAddr,
            ToAddr,
            str(BoothIndex),
            str(Distance),
            str(Progress),
            ETA,
            str(IsBooked),
        )
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Item already exists!")

    def modify_entity(
        self,
        ID: str,
        CargoType=None,
        CargoAmount=None,
        FromAddr=None,
        ToAddr=None,
        BoothIndex=None,
        Distance=None,
        Progress=None,
        ETA=None,
        IsBooked=None,
    ):
        result = self.query(ID)
        self.delete_entity(ID)
        CargoType = result[1] if CargoType is None else CargoType
        CargoAmount = result[2] if CargoAmount is None else CargoAmount
        FromAddr = result[3] if FromAddr is None else FromAddr
        ToAddr = result[4] if ToAddr is None else ToAddr
        BoothIndex = result[5] if BoothIndex is None else BoothIndex
        Distance = result[5] if Distance is None else Distance
        Progress = result[5] if Progress is None else Progress
        ETA = result[8] if ETA is None else ETA
        IsBooked = result[9] if IsBooked is None else IsBooked
        self.save_entity(ID, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked)

    def delete_entity(self, ID: str):
        sentence = "DELETE FROM cargo WHERE ID='{}' ".format(ID)
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Item does not exist.")

    def query(self, ID: str):
        sentence = "SELECT * FROM cargo WHERE ID='{}'".format(ID)
        try:
            self.db_c.execute(sentence)
            query_results = self.db_c.fetchall()
        except:
            print("Item does not exist!")
        if len(query_results) == 0:
            print("Item does not exist!")
            raise ValueError
        return query_results[0]

    def query_all(self):
        sentence = "SELECT * FROM cargo"
        self.db_c.execute(sentence)
        query_results = self.db_c.fetchall()
        return query_results

    def query_all(self):
        sentence = "SELECT * FROM cargo"
        self.db_c.execute(sentence)
        query_results = self.db_c.fetchall()
        return query_results

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
            ([Tx] TEXT, [ID] TEXT,
            PRIMARY KEY(Tx))
            """
        )
        self.conn.commit()
        self.db_c = c
        self.cargo = CargoDB()

    def MoveToPerm(
        self,
        tx: str,
        ID: str,
        CargoType: str = "",
        CargoAmount: int = 0,
        FromAddr: str = "",
        ToAddr: str = "",
        ETA: str = today,
        IsBooked: bool = False,
    ):
        sentence = " INSERT INTO tx (Tx,ID) VALUES ('{}','{}')".format(tx, ID)
        try:
            self.db_c.execute(sentence)
            self.conn.commit()
        except:
            print("Tx already exists!")
        self.cargo.save_entity(
            ID, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked
        )

    def DeletePerm(self, tx: str):
        sentence = "SELECT * FROM tx WHERE Tx='{}'".format(tx)
        try:
            self.db_c.execute(sentence)
            query_results = self.db_c.fetchall()
        except:
            print("Tx does not exist!")
        query_results = query_results[0]
        ID = query_results[1]
        sentence = "DELETE FROM tx WHERE Tx='{}' ".format(tx)
        self.db_c.execute(sentence)
        self.conn.commit()
        self.cargo.delete_entity(ID)


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

    def add_cargo(
        self,
        ID: str,
        CargoType: str = "",
        CargoAmount: int = 0,
        FromAddr: str = "",
        ToAddr: str = "",
        ETA: str = today,
        IsBooked: bool = False,
    ):
        self.waitToSumit.put(
            (ID, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked)
        )
        self.commit()

    def MoveToPerm(self, ID: str):
        ID, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked = self.txdict[ID][0]
        tx = self.txdict[ID][1]
        self.txdb.MoveToPerm(
            tx, ID, CargoType, CargoAmount, FromAddr, ToAddr, ETA, IsBooked
        )

    def DeletePerm(self, ID: str):
        tx = self.txdict[ID][1]
        self.txdb.DeletePerm(tx)


if __name__ == "__main__":
    print(DB.query_all())
