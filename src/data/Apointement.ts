
import {Appointement} from "../types/index";
import Api from "./Api";

export const NotesServices={
getAll: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/");
    return response.data  
}, 
getAlls: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/my-requests");
    return response.data  
},
getAl: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/my-stats");
    return response.data  
},
get: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/received-requests");
    return response.data  
},
getA: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/mentor-stats");
    return response.data  
},
gete: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/mentor-sessions");
    return response.data  
},

getes: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/my-stats");
    return response.data  
},
getts: async (): Promise<Appointement[]>=>{
    const response= await Api.get( "demande/my-sessions");
    return response.data  
},
aregistre:async (data: Partial<Appointement>):Promise<Appointement[]>=>{
const response= await Api.post( "demande/create-session" , data);
    return response.data
},

aregister:async (data: Partial<Appointement>):Promise<Appointement[]>=>{
const response= await Api.post( "demande/" , data);
    return response.data
},

put:async(data: Partial<Appointement>,id:string):Promise<Appointement[]>=>{
    const response=await Api.put(`demande/respond/${id}`,data);
    return response.data
},

puts:async(data: Partial<Appointement>,id:string):Promise<Appointement[]>=>{
    const response=await Api.put(`demande/${id}`,data);
    return response.data
}
}