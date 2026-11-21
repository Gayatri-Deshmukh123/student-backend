# Student Management Backend

A dependency-free Node.js REST API for managing students. It exposes JSON
endpoints and includes Docker and Kubernetes manifests.

## Run locally

```bash
npm start
```

The API listens on `PORT` (default `3000`) and stores data in
`DATA_FILE` (default `./data/students.json`).

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/ready` | Readiness probe |
| `GET` | `/api/students` | List all students |
| `POST` | `/api/students` | Create a student |
| `GET` | `/api/students/:id` | Get a student |
| `PUT` | `/api/students/:id` | Replace a student |
| `DELETE` | `/api/students/:id` | Delete a student |

## Kubernetes

```bash
kubectl apply -f k8s/
kubectl get all
```