from flask import Flask, render_template, request, jsonify
from time import sleep
from flask_caching import Cache
import pandas as pd

app = Flask(__name__)

config = {"CACHE_TYPE": "SimpleCache"}
app.config.from_mapping(config)
cache = Cache(app)


@app.route("/")
def index():
    """View function to render the main page

    Returns:
        html: index.html
    """
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    """Function that processes file upload

    Returns:
        list: column names
    """
    file = request.files["file"]

    data = pd.read_csv(file)

    cache.set("data", data)

    return "", 200


@app.route("/retrieve_data_columns", methods=["GET"])
def retrieve_data_columns():
    """Retrieve the data's column names

    Returns:
        list: column names for the data
    """
    columns = cache.get("data").columns.values.tolist()

    return jsonify(columns)


if __name__ == "__main__":
    app.run()
