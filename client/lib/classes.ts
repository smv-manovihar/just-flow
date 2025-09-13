import { FlowNode } from "@/types/flow.type";

class Flow {
    constructor(public title : string, public nodes : Node[]) {

    }
}

class Node {
    constructor(node : FlowNode){
        this.id = node.id;
        this.title = node.title;
        this.type = node.type;
        this.content = node.content;
        this
    }
}