import sqlite3
import datetime
import queue
from threading import Lock

today = datetime.datetime.now().strftime("%x")


class CargoDB:
    def __init__(self) -> None:
        self.lock = Lock()
        self.lock.acquire(True)
        conn = sqlite3.connect("vguard.db", check_same_thread=False)
        c = conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS cargo
            ([ID] TEXT, [CargoType] TEXT, [CargoAmount] INTEGER, [FromAddr] TEXT, [ToAddr] TEXT, [BoothIndex] INTEGER, [Distance] TEXT, [Progress] TEXT, [ETA] TEXT, [IsBooked] TEXT,
            PRIMARY KEY(ID))
            """
        )
        conn.commit()
        try:
            c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('0','Manure',3000,'Ranch','Farm',1,'0','0','{today}','False')"
            )
            c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('1','Corn',10000,'Farm','Ranch',2,'0','0','{today}','False')"
            )
            c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('2','Pineapple',5000,'Farm','Cannery',3,'0','0','{today}','False')"
            )
            c.execute(
                f"INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,BoothIndex,Distance,Progress,ETA,IsBooked) VALUES ('3','Meat',2000,'Ranch','Cannery',4,'0','0','{today}','False')"
            )
            conn.commit()
        except:
            pass
        c.close()
        conn.close()
        self.lock.release()

    def save_entity(
        self,
        ID: str,
        CargoType: str = "",
        CargoAmount: int = 0,
        FromAddr: str = "",
        ToAddr: str = "",
        ETA: str = today,
        IsBooked: bool = False,
    ):
        self.lock.acquire(True)
        conn = sqlite3.connect("vguard.db", check_same_thread=False)
        c = conn.cursor()
        try:
            CargoAmount = int(CargoAmount)
        except:
            print("Illegal input of the cargo amount!")
            raise ValueError
        sentence = f" INSERT INTO cargo (ID,CargoType, CargoAmount,FromAddr,ToAddr,ETA,IsBooked) VALUES ('{ID}','{CargoType}',{CargoAmount},'{FromAddr}','{ToAddr}','{ETA}','{str(IsBooked)}')"
        try:
            c.execute(sentence)
            conn.commit()
        except:
            print("Item already exists!")
        c.close()
        conn.close()
        self.lock.release()

    def modify_entity(
        self,
        ID: str,
        CargoType=None,
        CargoAmount=None,
        FromAddr=None,
        ToAddr=None,
        ETA=None,
        IsBooked=None,
    ):
        result = self.query(ID)
        self.delete_entity(ID)
        CargoType = result[1] if CargoType is None else CargoType
        CargoAmount = result[2] if CargoAmount is None else CargoAmount
        FromAddr = result[3] if FromAddr is None else FromAddr
        ToAddr = result[4] if ToAddr is None else ToAddr
        ETA = result[5] if ETA is None else ETA
        IsBooked = result[6] if IsBooked is None else IsBooked
        self.save_entity(
            ID,
            CargoType,
            CargoAmount,
            FromAddr,
            ToAddr,
            ETA,
            IsBooked,
        )

    def delete_entity(self, ID: str):
        conn = sqlite3.connect("vguard.db", check_same_thread=False)
        c = conn.cursor()
        self.lock.acquire(True)
        sentence = "DELETE FROM cargo WHERE ID='{}' ".format(ID)
        try:
            c.execute(sentence)
            conn.commit()
        except:
            print("Item does not exist.")
        c.close()
        conn.close()
        self.lock.release()

    def query_core(self, item_name: str, content):
        self.lock.acquire(True)
        conn = sqlite3.connect("vguard.db", check_same_thread=False)
        c = conn.cursor()
        sentence = f"SELECT * FROM cargo WHERE {item_name}='{content}'"
        try:
            c.execute(sentence)
            query_results = c.fetchall()
            conn.commit()
        except:
            print("Item does not exist!")
        if len(query_results) == 0:
            print("Item does not exist!")
            raise ValueError
        c.close()
        conn.close()
        self.lock.release()
        return query_results

    def query(self, ID: str):
        return self.query_core("ID", ID)[0]

    def query_all(self):
        self.lock.acquire(True)
        conn = sqlite3.connect("vguard.db", check_same_thread=False)
        c = conn.cursor()
        sentence = "SELECT * FROM cargo"
        c.execute(sentence)
        query_results = c.fetchall()
        conn.commit()
        c.close()
        conn.close()
        self.lock.release()
        return query_results

    def filter_FromAddr(self, FromAddr: str):
        return self.query_core("FromAddr", FromAddr)

    def filter_ToAddr(self, ToAddr: str):
        return self.query_core("ToAddr", ToAddr)

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
        BoothIndex: int = 0,
        Distance: float = 0.0,
        Progress: float = 0.0,
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
            ID,
            CargoType,
            CargoAmount,
            FromAddr,
            ToAddr,
            BoothIndex,
            Distance,
            Progress,
            ETA,
            IsBooked,
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
        BoothIndex: int = 0,
        Distance: float = 0.0,
        Progress: float = 0.0,
        ETA: str = today,
        IsBooked: bool = False,
    ):
        self.waitToSumit.put(
            (
                ID,
                CargoType,
                CargoAmount,
                FromAddr,
                ToAddr,
                BoothIndex,
                Distance,
                Progress,
                ETA,
                IsBooked,
            )
        )
        self.commit()

    def MoveToPerm(self, ID: str):
        (
            ID,
            CargoType,
            CargoAmount,
            FromAddr,
            ToAddr,
            BoothIndex,
            Distance,
            Progress,
            ETA,
            IsBooked,
        ) = self.txdict[ID][0]
        tx = self.txdict[ID][1]
        self.txdb.MoveToPerm(
            tx,
            ID,
            CargoType,
            CargoAmount,
            FromAddr,
            ToAddr,
            BoothIndex,
            Distance,
            Progress,
            ETA,
            IsBooked,
        )

    def DeletePerm(self, ID: str):
        tx = self.txdict[ID][1]
        self.txdb.DeletePerm(tx)


if __name__ == "__main__":
    db = CargoDB()
    print(db.query_all())
    db.save_entity("4", "Meat", 100, "Home", "School", 1, 200, 0.3)
    print(db.query_all())
    db.delete_entity("0")
    print(db.query_all())
