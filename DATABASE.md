# Creación de la Base de Datos    
                                       
 La base de datos se compone de tres  
 colecciones principales: 
 - `users`   
 - `publications`
 - `ratings`          

 # Colección `users`               
    
```bash
{                                    
   _id: ObjectId,                    
   username: String,                 
   email: String,                    
   password: String,                 
   university: String,               
   createdAt: Date,                  
   updatedAt: Date                   
 }  
```                                   
                                   

 # Colección `publications`        
    
```bash
{                                    
   _id: ObjectId,                    
   name: String,                     
   subject: String,                  
   university: String,               
   author: ObjectId,                 
   file: {                           
             filename: String,              
             contentType: String,           
             length: Number,                
             uploadDate: Date               
   },                                
   featured: Boolean,               
   downloadCount: Number,           
   createdAt: Date,                 
   updatedAt: Date                  
}  
```                                   
                                   

 # Colección `ratings`             
  
```bash
{                                    
   _id: ObjectId,                    
   publicationId: ObjectId,         
   userId: ObjectId,                 
   rating: Number,                   
   createdAt: Date,                  
   updatedAt: Date                   
} 
```                                       
                                    

 # Consideraciones sobre la estructura 
                                       
 ### Se utiliza `ObjectId` para los campos 
   `_id`, que MongoDB genera automáticamente. 
 ### Los campos `createdAt` y `updatedAt` ayudan 
   a rastrear cuándo se crearon y actualizaron 
   por última vez los documentos.          
 ### En la colección `publications`, el campo  
   `author` es una referencia al `_id` del  
   usuario en la colección `users`.        
 ### El campo `file` en `publications` contiene 
   metadatos sobre el archivo PDF. El archivo 
   en sí se guardará en GridFS.            
 ### La colección `ratings` está separada de  
   `publications` para permitir un mejor    
   rendimiento y escalabilidad.          

 # Creación de las colecciones en MongoDB 
 
```bash
db.createCollection("users")          
db.createCollection("publications")    
db.createCollection("ratings")        
```                                        
  

 # Creación de índices               
  
```bash
db.users.createIndex(             { username: 1 },                    { unique: true })                   
db.users.createIndex(            { email: 1 },                       { unique: true })                   
db.publications.createIndex(     { author: 1 }) 
db.publications.createIndex(     { subject: 1 }) 
db.publications.createIndex(     { university: 1 }) 
db.ratings.createIndex(          { publicationId: 1, userId: 1 },    { unique: true })  
```                                       
      
