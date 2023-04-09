<h1 align="center"> V-Guard applied in SCM (Supply Chain Management) system. </h1>

Contributors: Dixi Yao, Kai Shen, Xiaochong Wei

## Introduction

We propose a solution for tracking goods and services in supply chain system by using V-Guard, which is designed for V2X network and can fit well for supply chain since trucks are main transportation power of the system.

## Features

### Viechle visualization
We use google map to visualize the viechle's location and route, also mark the location of each participant in the supply chain.
![Viechle visualization](./docs/map-example.gif)
When you click the marker of a viechle, you can see the detail information of the viechle at the bottom of the page, including:
- Cargo ID: the index of the cargo.
- Cargo type: the type of the cargo the truck is carrying.
- Cargo amount: the amount of the cargo the truck is carrying.
- From: the location where the truck is from.
- To: the location where the truck is going to.
- Progress: the progress of the truck's route.
- Is booked: whether the truck is booked for the next shippment.

This can help the participants to know better the location of the truck and the progress of the truck's route. 

### Database backend
We provide a database backend in the infrastructure layer to support the data collection for V-Guard. The database is developed on the basis of the ```sqlite3```. It is developed in the ```dpapi.py``` and the whole database is named ```vguard.db```. 

For the V-Guard, we provide two interfaces through the database and the V-Guard to support managing transactions from moving temporary storage to the permanent storage, and deleting from the permanent storage. The related information of the transactions are stored in the TABLE Tx and we can use the class ```DB_hanlder``` to manage transactions between the V-Guard and database. Functions ```MoveToPerm``` and ```DeletePerm``` correspond to the ```sm.MoveToPerm(&tx)``` and ```sm.DeletPerm(&tx)``` interfaces in V-Guard.

Besides this, we also developed an interface for managing detailed information about each transaction, which is the information of each cargo in our setting. It is stored in the TABLE cargo. The detailed attributes include
- ID: A unique ID which is used as KEY in the table.
- CargoType: The type of the cargo.
- CargoAmount: The amount of the cargo, which is an integer.
- FromAddr: The address where the cargo is sent out.
- ToAddr: The address where ther cargo is sent to.
- BoothIndex: The booth index where the current transaction of the cargo is stored.
- Distance: The distance the cargo will go through.
- Progress: Approximately how much distance the cargo has gone through.
- ETA: A timestamp for when the cargo set out.
- IsBooked: A boolean value indicating whether the cargo is booked.
For the cargos, we provide the interface including adding cargo, deleting cargo, modifying cargo information and query related information about existing cargos.

We also support the database by adding a Flask server so that the frontend can interact with the database and V-Guard through these APIs we developed.

## Quick Start

For the backend, you can follow these steps to run the database:
- create a new conda environment: `conda create --name ece1770 python=3.9`
- activate the environment: `conda activate ece1770`
- install required packages: `pip install -r requirements.txt`


For frontend, you can follow these steps to run the project:
- Enter the frontend directory: `cd web`
- Install dependencies: `npm install`
- Run the project: `npm start`, then you can visit the project at `http://localhost:3000`
