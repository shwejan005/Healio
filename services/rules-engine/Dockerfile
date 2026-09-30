FROM golang:1.27-alpine AS build
WORKDIR /src
COPY main.go ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /rules-engine main.go

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /rules-engine /rules-engine
EXPOSE 8081
ENTRYPOINT ["/rules-engine"]
