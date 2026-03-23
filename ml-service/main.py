from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.cluster import DBSCAN

app = FastAPI()

class CoordinateInput(BaseModel):
    coordinates: List[List[float]]

@app.post("/cluster")
def cluster_potholes(input: CoordinateInput):

    coords = np.array(input.coordinates)

    model = DBSCAN(eps=0.0003, min_samples=3)
    labels = model.fit_predict(coords)

    clusters = {}

    for i, label in enumerate(labels):
        if label == -1:
            continue

        if label not in clusters:
            clusters[label] = []

        clusters[label].append(coords[i].tolist())

    result = []
    for cluster in clusters.values():
        cluster = np.array(cluster)
        centroid = cluster.mean(axis=0)

        result.append({
            "latitude": float(centroid[0]),
            "longitude": float(centroid[1]),
            "count": len(cluster),
            "severity":calculate_severity(len(cluster))
        })

    return {"clusters": result}

def calculate_severity(count):
    if count>10:
        return "dangerous"
    elif count >5:
        return "bad"
    elif count>2:
        return "moderate"
    return "low"