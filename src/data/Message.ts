
import{ Message } from "../types/index";
import Api from "./Api";

export const NotesServices={
getById:async (id: string):Promise<Message[]>=>{
    const response=await Api.delete(`messages/${id}`)
    return response.data
},
aregistre:async (data: Partial<Message>):Promise<Message[]>=>{
const response= await Api.post( "messages/ajoute/" , data);
    return response.data
},

}