import {User ,MentorshipRequest }from "../types/index";
import Api from "./Api";

export const UserServices={
getAll: async (): Promise<User[]>=>{
    const response= await Api.get( "/users/get/");
    return response.data  
}, 

getById:async (id: string):Promise<User[]>=>{
    const response=await Api.get(`/users/getByid/${id}`)
    return response.data
},
aregistre:async (payload: Partial<User> | FormData):Promise<User[]>=>{
    const response = await Api.post( "/auth/register", payload);
    return response.data
},
login:async (data: Partial<User>):Promise<User[]>=>{
const response= await Api.post( "/auth/login" , data);
    return response.data
},
logout:async (data: Partial<User>):Promise<User[]>=>{
const response= await Api.post( "/auth/logout" , data);
    return response.data
},
delete:async (id: string):Promise<User[]>=>{
    const response=await Api.delete(`/users/delete/${id}`)
    return response.data
},
put:async(data: Partial<User>,id:string):Promise<User[]>=>{
    const response=await Api.put(`/users/put/${id}`,data);
    return response.data
}
}