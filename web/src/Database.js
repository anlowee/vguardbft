import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"
import './Database.css';

function Database() {
    const socket = io("http://localhost:8000", {
        transports: ["websocket"],
    });
    const [items, setItems] = useState([]);
    const [deleteID, setDeleteID] = useState("");

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

    const handleAddItem = (event) => {
        event.preventDefault();
        const newItem = {
            ID: event.target.id.value,
            CargoType: event.target.att1.value,
            CargoAmount: event.target.att2.value,
            FromAddr: event.target.att1.value,
            ToAddr: event.target.att2.value,
            BoothIndex: event.target.att1.value,
            Distance: event.target.att2.value,
            Progress: event.target.att1.value,
            ETA: event.target.att2.value,
            IsBooked: event.target.att2.value,
        };

        // emit the "add_cargo" event with the form data
        socket.emit("add_cargo", newItem);

        // clear the input fields
        event.target.reset();
    };

    const handleDeleteItem = () => {
        // emit the "delete_cargo" event with the ID of the item to be deleted
        socket.emit("delete_cargo", { ID: deleteID });

        // Reset the input box
        setDeleteID("");
    };

    return (
        <div className="database-page">

            <div className="left-column">
                <h2>Add Items</h2>
                <form onSubmit={handleAddItem}>
                    <div className="form-group">
                        <label htmlFor="id">Cargo ID:</label>
                        <input type="text" name="id" maxLength="8" placeholder="cargo ID" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="CargoType">Cargo Type:</label>
                        <input type="text" name="CargoType" maxLength="8" placeholder="cargo type" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="CargoAmount">Cargo Amount:</label>
                        <input type="text" name="CargoAmount" maxLength="8" placeholder="cargo amount" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="FromAddr">From Address:</label>
                        <input type="text" name="FromAddr" maxLength="8" placeholder="from address" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ToAddr">To Address:</label>
                        <input type="text" name="ToAddr" maxLength="8" placeholder="to address" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="BoothIndex">Booth Index:</label>
                        <input type="text" name="BoothIndex" maxLength="8" placeholder="booth index" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Distance">Distance:</label>
                        <input type="text" name="Distance" maxLength="8" placeholder="distance" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Progress">Progress:</label>
                        <input type="text" name="Progress" maxLength="8" placeholder="progress" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ETA">ETA:</label>
                        <input type="text" name="ETA" maxLength="8" placeholder="ETA" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="IsBooked">Is Booked:</label>
                        <input type="text" name="IsBooked" maxLength="8" placeholder="is booked" required />
                    </div>
                    <button type="submit">Add Data</button>
                    <div className="form-group">
                        <label htmlFor="deleteID">Delete Item by ID:</label>
                        <input type="text" name="deleteID" maxLength="8" placeholder="ID" value={deleteID} onChange={(event) => setDeleteID(event.target.value)} />
                        <button type="button" onClick={handleDeleteItem}>Delete</button>
                    </div>
                </form>

            </div>

            <div className="right-column">
                <h2>All Items in DB</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>CargoType</th>
                            <th>CargoAmount</th>
                            <th>FromAddr</th>
                            <th>ToAddr</th>
                            <th>BoothIndex</th>
                            <th>Distance</th>
                            <th>Progress</th>
                            <th>ETA</th>
                            <th>IsBooked</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ID}</td>
                                <td>{item.CargoType}</td>
                                <td>{item.CargoAmount}</td>
                                <td>{item.FromAddr}</td>
                                <td>{item.ToAddr}</td>
                                <td>{item.BoothIndex}</td>
                                <td>{item.Distance}</td>
                                <td>{item.Progress}</td>
                                <td>{item.ETA}</td>
                                <td>{item.IsBooked}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Database;