import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client"
import './Database.css';

function Database(props) {
    const { trucks, setTrucks } = props;

    const socket = io("http://localhost:8000", {
        transports: ["websocket"],
    });
    const [items, setItems] = useState([]);
    // const [deleteID, setDeleteID] = useState("");


    useEffect(() => {
        setTimeout(() => {
            console.log("Before EMIT!")
            socket.emit("query_all");
            console.log("Send query_all to backend!")

            // Listen for the "query_all_result" event from the server
            socket.on("query_all_result", (data) => {
                console.log(data.result)
                console.log("!!!!!")
                if (data.result === "success") {
                    // Update the "items" state with the received data
                    console.log(data.data)
                    setItems(data.data);
                } else {
                    console.log("Error:", data.message);
                }
            });

            console.log("After the listening")
            // Clean up the socket connection when the component unmounts
            return () => socket.close();
        }, 1000);
    }, []);

    const handleAddItem = useCallback((event) => {
        event.preventDefault();
        const newItem = {
            ID: event.target.id.value,
            CargoType: event.target.CargoType.value,
            CargoAmount: event.target.CargoAmount.value,
            FromAddr: event.target.FromAddr.value,
            ToAddr: event.target.ToAddr.value,
            // BoothIndex: event.target.BoothIndex.value,
            // Distance: event.target.Distance.value,
            // Progress: event.target.Progress.value,
            ETA: event.target.ETA.value,
            IsBooked: event.target.IsBooked.value,
        };
        setTrucks(trucks => {
            const truck = {
                truckNumber: parseInt(newItem.ID),
                cargoType: newItem.CargoType,
                cargoAmount: newItem.CargoAmount,
                fromAddr: newItem.FromAddr,
                toAddr: newItem.ToAddr,
                boothIndex: -1,
                distance: 0,
                progress: '0%',
                isBooked: newItem.IsBooked,
            }
            return [...trucks, truck];
        })

        // emit the "add_cargo" event with the form data
        socket.emit("add_cargo", newItem);

        // clear the input fields
        event.target.reset();
    }, [trucks]);


    const handleDeleteItem = useCallback((event) => {
        event.preventDefault();
        setTrucks(trucks.filter(truck => truck.truckNumber !== parseInt(event.target.deleteID.value)));
        // emit the "delete_cargo" event with the ID of the item to be deleted
        socket.emit("delete_cargo", { ID: event.target.deleteID.value });

        // // Reset the input box
        // setDeleteID("");

        // clear the input fields
        event.target.reset();
    }, [trucks]);

    return (
        <div className="database-page">
            <div className="top-section">
                <h2>All Items in DB</h2>
                <div className="right-column">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>CargoType</th>
                                <th>CargoAmount</th>
                                <th>FromAddr</th>
                                <th>ToAddr</th>
                                {/* <th>BoothIndex</th>
                                <th>Distance</th>
                                <th>Progress</th> */}
                                <th>ETA</th>
                                <th>IsBooked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item[0]}>
                                    <td>{item[0]}</td>
                                    <td>{item[1]}</td>
                                    <td>{item[2]}</td>
                                    <td>{item[3]}</td>
                                    <td>{item[4]}</td>
                                    {/* <td>{item[5]}</td>
                                    <td>{item[6]}</td>
                                    <td>{item[7]}</td> */}
                                    <td>{item[8]}</td>
                                    <td>{item[9]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bottom-section">
                <div className="left-column">
                    {/* Add Item form code */}
                    <h2>Add Item</h2>
                    <form onSubmit={handleAddItem} className="form">
                        <div className="form-group form-quarter">
                            <label htmlFor="id">Cargo ID:</label>
                            <input type="text" name="id" maxLength="8" placeholder="Cargo ID" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="CargoType">Cargo Type:</label>
                            <input type="text" name="CargoType" maxLength="8" placeholder="Cargo Type" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="CargoAmount">Cargo Amount:</label>
                            <input type="text" name="CargoAmount" maxLength="8" placeholder="Cargo Amount" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="FromAddr">From Address:</label>
                            <input type="text" name="FromAddr" maxLength="8" placeholder="From Address" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="ToAddr">To Address:</label>
                            <input type="text" name="ToAddr" maxLength="8" placeholder="To Address" required />
                        </div>
                        {/* <div className="form-group form-quarter">
                            <label htmlFor="BoothIndex">Booth Index:</label>
                            <input type="text" name="BoothIndex" maxLength="8" placeholder="Booth Index" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="Distance">Distance:</label>
                            <input type="text" name="Distance" maxLength="8" placeholder="Distance" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="Progress">Progress:</label>
                            <input type="text" name="Progress" maxLength="8" placeholder="Progress" required />
                        </div> */}
                        <div className="form-group form-quarter">
                            <label htmlFor="ETA">ETA:</label>
                            <input type="text" name="ETA" maxLength="8" placeholder="ETA" required />
                        </div>
                        <div className="form-group form-quarter">
                            <label htmlFor="IsBooked">Is Booked:</label>
                            <input type="text" name="IsBooked" maxLength="8" placeholder="Is Booked" required />
                        </div>
                        <div className="button-container">
                            <button type="submit" className="submit-button">Add Item</button>
                        </div>
                    </form>
                </div>
            </div >
            <div className="left-column">
                <h2>Delete Item</h2>
                <form onSubmit={handleDeleteItem} className="form">
                    <div className="form-group form-half">
                        <label htmlFor="deleteID">Cargo ID:</label>
                        <input type="text" name="deleteID" maxLength="8" placeholder="Cargo ID" required />
                    </div>
                    <div className="button-container1">
                        <button type="submit">Delete Item</button>
                    </div>
                </form>
            </div>
        </div >
    );
}

export default Database;