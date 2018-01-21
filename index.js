const csv = require("fast-csv");
const fs = require("fs");
const uuidv4 = require("uuid/v4");

const vertexFileIn = "./vertices.csv";
const edgeFileIn = "./edges.csv";

const vertexFileOut = "vertices.json";
const edgeFileOut = "edges.json";

const vertices = {};
const edges = [];
const createId = () => uuidv4().replace(/-/g,'');
const graphId = createId();

const createEpgmVertex = (id, label, attr) => {
    attr._id = id
    return {
        id: createId(),
        data: attr,
        meta: {
            label,
            graphs: [ graphId ],
        },
    };
}

const createEpgmEdge = (src, dst, label, attr) => {
    console.log(`${src} ${dst} ${label} ${attr}`);
    return {
        id: createId(),
        src: vertices[src].id,
        dst: vertices[dst].id,
        data: attr,
        meta: {
            label,
            graphs: [ graphId ],
        },
    };
}

csv.fromPath(vertexFileIn, { headers: true })
    .on("data", (data) => {
        console.log(`${data.id} ${data.attr1} ${data.attr2}`);
        obj = createEpgmVertex(data.id, "Person", { attr1: data.attr1, attr2: data.attr2 });
        vertices[data.id] = obj;
    })
    .on("end", () => {
        fs.writeFile(
            vertexFileOut, 
            Object.values(vertices).map(JSON.stringify).join("\n"), 
            'utf8', 
            () => console.log("done writing vertices"));
    });

csv.fromPath(edgeFileIn, { headers: true })
    .on("data", (data) => {
        edges.push(JSON.stringify(
            createEpgmEdge(data.src, data.dst, "Edge", {attr1: data.attr1})));
    })
    .on("end", () => {
        fs.writeFile(
            edgeFileOut,
            edges.join("\n"),
            'utf8',
            () => console.log("done writing edges"));
    });
