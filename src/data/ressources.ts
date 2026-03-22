
import {Resource} from "../types/index";
import Api from "./Api";

export const NotesServices={
getAll: async (): Promise<Resource[]>=>{
    const response= await Api.get( "resources/");
    return response.data  
}, 



aregistre:async (data: Partial<Resource>):Promise<Resource[]>=>{
const response= await Api.post( "resources/" , data);
    return response.data
},


}
