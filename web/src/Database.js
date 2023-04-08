import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"
import './Database.css';

function Database() {
    const socket = io("http://localhost:8000", {
        transports: ["websocket"],
    });
    const [items, setItems] = useState([]);

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
            id: event.target.id.value,
            att1: event.target.att1.value,
            att2: event.target.att2.value,
        };

        setItems([...items, newItem]);
    };

    return (
        <div className="database-page">

            <div className="left-column">
                <h2>Add Items</h2>
                <form onSubmit={handleAddItem}>
                    <div className="form-group">
                        <label htmlFor="id">Cargo ID:</label>
                        <input
                            type="text"
                            name="id"
                            maxLength="8"
                            placeholder="cargo ID"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="att1">Cargo Attribute 1:</label>
                        <input
                            type="text"
                            name="att1"
                            maxLength="8"
                            placeholder="cargo attribute 1"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="att2">Cargo Attribute 2:</label>
                        <input
                            type="text"
                            name="att2"
                            maxLength="8"
                            placeholder="cargo attribute 2"
                            required
                        />
                    </div>
                    <button type="submit">Add Data</button>
                </form>

            </div>

            <div className="right-column">
                <h2>All Items in DB</h2>
                <table>
                    <thead>
                        <tr>
                            <th>CargoType</th>
                            <th>CargoAmount</th>
                            <th>FromAddr</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ID}</td>
                                <td>{item.CargoType}</td>
                                <td>{item.CargoAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Database;