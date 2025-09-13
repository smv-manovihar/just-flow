export type Flow = {
    id:string;
    userId:string;
    title:string;
    tags:string[];
    systemTags:string[];
    type:string;
    visibility:string;
    headNode:string;
    nodes:string[];
    sharedWith:FlowSharedWith[];
    isSharedEditable:boolean;
    paidUsers:{
        userId:string;
        canReFlow:boolean;
    }[];
    reFlowedFrom:{
        userId:string;
        flowId:string;
    }[];
    origin:{
        userId:string;
        flowId:string;
    };
    price:number;
    isCommitted:boolean;
    isDraft:boolean;
}

export type FlowNode = {
    id:string;
    flowId:string;
    title:string;
    content:string;
    tags:string[];
    systemTags:string[];
    type: 'flow' | 'text' | 'image' | 'audio' | 'video' | 'file' | 'embed' | 'choice';
    connections:FlowNodeConnection[];
    mediaUrl:string;
    isheadNode:boolean;
    isEndNode:boolean;
}

export type FlowNodeConnection = {
    nodeId:string;
    name:string;
    type: 'next' | 'sibling' | 'parent';
}

export type FlowSharedWith = {
    userId:string;
    role:'admin' | 'editor' | 'viewer';
}