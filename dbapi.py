from cargodb import CargoDB
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
# db = CargoDB()


@socketio.on("add_cargo")
def handle_add_cargo(data):
    try:
        db.save_entity(
            data["ID"],
            data["CargoType"],
            data["CargoAmount"],
            data["FromAddr"],
            data["ToAddr"],
            data["BoothIndex"],
            data["Distance"],
            data["Progress"],
            data["ETA"],
            data["IsBooked"],
        )

        # emit the "query_all" event to refresh the data
        socketio.emit("query_all")

        return {"result": "success"}
    except ValueError:
        return {"result": "error", "messgae": "Illegal input!"}


@socketio.on("modify_cargo")
def handle_modify_cargo(data):
    try:
        db.modify_entity(
            data["ID"],
            data["CargoType"],
            data["CargoAmount"],
            data["FromAddr"],
            data["ToAddr"],
            data["BoothIndex"],
            data["Distance"],
            data["Progress"],
            data["ETA"],
            data["IsBooked"],
        )
        return {"result": "success"}
    except ValueError:
        return {"result": "error", "messgae": "Illegal input!"}


@socketio.on("delete_cargo")
def handle_delete_cargo(data):
    try:
        db.delete_entity(
            data["ID"],
        )

        # emit the "query_all" event to refresh the data
        socketio.emit("query_all")

        return {"result": "success"}
    except ValueError:
        return {"result": "error", "messgae": "Illegal input!"}


@socketio.on("query_cargo")
def handle_query_cargo(data):
    try:
        items = db.query(
            data["ID"],
        )
    except ValueError:
        return {"result": "error", "messgae": "Illegal input!"}
    return items


@socketio.on("query_all")
def handle_query_all():
    print("Received the signal!!!!", flush=True)
    try:
        items = db.query_all()
        print("Query successful")
        socketio.emit("query_all_result", {"result": "success", "data": items})
    except ValueError:
        socketio.emit(
            "query_all_result", {"result": "error", "message": "Illegal input!"}
        )


if __name__ == "__main__":
    db = CargoDB()
    socketio.run(app, port=8000, debug=True)
