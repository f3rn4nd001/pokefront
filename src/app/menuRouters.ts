import { ModuleWithProviders } from "@angular/core";
import { Routes,RouterModule } from "@angular/router";

//import components

import { UsuarioConsultaComponent } from "./Component/Catalogo/usuario/usuario-consulta/usuario-consulta.component";
//defin rutas


const menurouting:ModuleWithProviders<any>=RouterModule.forRoot(
    [
        {path:'Catalogo/usuarios/Consulta',component:UsuarioConsultaComponent},
    ]
);
export var objRutasMenuRutas=[
    menurouting
];