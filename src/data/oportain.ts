
import {Opportunity} from "../types/index";
import Api from "./Api";

export const NotesServices={
getAll: async (): Promise<Opportunity[]>=>{
    const response= await Api.get( "oportain/");
    return response.data  
}, 



aregistre:async (data: Partial<Opportunity>):Promise<Opportunity[]>=>{
const response= await Api.post( "oportain/" , data);
    return response.data
},


}
