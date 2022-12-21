import { Component, OnInit,VERSION } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators,ReactiveFormsModule,FormsModule,FormArray} from '@angular/forms';
import { UsuarioserviceService } from "../../../../service/catalogo/usuario/usuarioservice.service";
import { ErrorComponent } from '../../../Alerts/error/error.component';
import {MatDialogModule,MatDialog} from '@angular/material/dialog';
import { GuardarComponent } from '../../../Alerts/guardar/guardar.component';
import { LoginService } from "../../../../service/Login/login.service";
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { UsuarioDetallesComponent } from '../usuario-detalles/usuario-detalles.component';

@Component({
  selector: 'app-ususario-registro',
  templateUrl: './ususario-registro.component.html',
  styleUrls: ['./ususario-registro.component.css']
})

export class UsusarioRegistroComponent implements OnInit {
  public reactiveForm: any = FormGroup;
  public datos: any = {};
  public ecodUsuarios : any = '';
  public permisos="";
  public const =1;
  public submenus: any = {};
  public apro="Consulta/Usuario/Registrar";
  public validadContras = 0;
  public log : any={} 
  public ContraformGroup: any = FormGroup;

  constructor(
    public router: Router,
    private _service:UsuarioserviceService,
    public dialog: MatDialog,
    private LoginServices:LoginService
  ) { }

  ngOnInit(): void {
    this.Permisos();
    this.ecodUsuarios = localStorage.getItem('ecodUsuarios');  
    if (this.ecodUsuarios) {
      this.getEditarRegistro();
    }
    this.ContraformGroup = new FormGroup({
      'Contrasena': new FormControl('', Validators.required),
    });
    this.reactiveForm = new FormGroup({
      'ecodUsuarios': new FormControl(this.ecodUsuarios),
      'tNombre': new FormControl('', [Validators.required]),
      'fhNacimiento': new FormControl('', [Validators.required]),
      'tApellido': new FormControl('', [Validators.required]),
      'Celulares': new FormArray([]),
      'Mails': new FormArray([])
    });
  }
  Permisos(){
    this.submenus = localStorage.getItem('submenus');    
    this.submenus = JSON.parse(this.submenus);     
    if (this.submenus) {
      this.submenus.forEach((element:any) => {  
        if (element.controller === this.apro ) {
         this.const = 0;
         this.permisos=element.permisosNCorto
        }
      });
    } 
    if (this.const == 1) {
      window.history.back();
    }
  }
  validadContrasena(params:any){
    this.log.contrasena = params
    this.log.loginEcodUsuarios= localStorage.getItem('loginEcodUsuarios');
    this.LoginServices.getContra(this.log).then((response:any)=>{
      this.validadContras = response.sql.dl
    })
  }
  getEditarRegistro(){
    this._service.getDetalle(this.ecodUsuarios).then((response:any)=>{
      let datosUsuarios =(response.sql);   
      this.datos.tNombre = datosUsuarios.tNombre; 
      this.datos.fhNacimiento = datosUsuarios.fhNacimiento;    
      this.datos.tApellido = datosUsuarios.tApellido;
      this.datos.cel= response.relcelres;
      this.datos.cel.forEach((icarcore:any) => {
        if(icarcore.tcelular != null){
          (this.reactiveForm.controls['Celulares'] as FormArray).push(new FormGroup({
              'telefono': new FormControl(icarcore.tcelular),
          }))
        }
      });  
      this.datos.mail= response.relMailres;
      this.datos.mail.forEach((icarcore:any) => {
        if(icarcore.tcorreo != null){
          (this.reactiveForm.controls['Mails'] as FormArray).push(new FormGroup({
              'gmail': new FormControl(icarcore.tcorreo),
              'Codigomail':new FormControl(icarcore.ecodCorreo)
          }))
        }
      }); 
      localStorage.removeItem('ecodUsuarios');
    }).catch((error)=>{});
  }
  annadirinputCel() {
    (this.reactiveForm.controls['Celulares']).push(new FormGroup({
      'telefono': new FormControl('', Validators.required)
    }));
  }
  annadirinputMail() {
    (this.reactiveForm.controls['Mails']).push(new FormGroup({
      'gmail': new FormControl('', Validators.required),
      'Codigomail': new FormControl('', Validators.required)
    }));
  }
  eliminarinputMail(index: number) {
    (this.reactiveForm.controls['Mails']).removeAt(index);
  }
  eliminarinputCel(index: number) {
    (this.reactiveForm.controls['Celulares']).removeAt(index);
  }
  onSubmit() {
    let errorsviaje:any = [];
    let bandera = 1;
    
    
    if (!this.reactiveForm.value.tNombre) {
      errorsviaje.push("El campo 'nombre' es requerido");
      bandera = 0;
    }
    if (bandera == 0) {
      let dialogRef = this.dialog.open(ErrorComponent, {
        data: { titulo: "Revise los campos marcados en rojo", listado: errorsviaje } 
      });
    }
    if (!this.ecodUsuarios || this.ecodUsuarios == 'null') {
    
          if (bandera == 1) {
            let dialogRef = this.dialog.open(GuardarComponent, {
              data: {titulo: "Guardar", subtitulo: "¿Deseas guardar la información?", cancelar: '1'} 
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result == 1) {
                let data = this.reactiveForm.value
                this._service.postRegistro(data).then((response:any)=>{
                  this.datos.ecodUsuario = response.codigo;
                  this.datos.exito = response.exito;
                  let dialogRef = this.dialog.open(GuardarComponent, {
                    width: '450px',
                    data: { titulo: response.exito == 1 ? "Éxito " : "Error", subtitulo: response.exito == 1 ? "La información se guardó exitosamente " : "Ocurrio un error al guardar" }
                  });
                  if (this.datos.exito == 1) {
                    dialogRef.afterClosed().subscribe(result => {
                      this._service.getDetalle(this.datos.ecodUsuario).then((response:any)=>{
      
                        let dialogRef = this.dialog.open(UsuarioDetallesComponent, {
                          data: { titulo: "Detalle de usuario",usuario:response.sql, relcelres:response.relcelres,relMailres:response.relMailres}
                        });
                        dialogRef.afterClosed().subscribe(result => { 
                          this.router.navigate(['Catalogo/usuarios/Consulta']);      
                        });
                      }).catch((error)=>{});
                     
                    });
                  }
                }).catch((error)=>{});
              }
            });
          }
       // }
     // })
    }
    else{ 
      if (bandera == 1) {
        let dialogRef = this.dialog.open(GuardarComponent, {
          data: {titulo: "Guardar", subtitulo: "¿Deseas guardar la información?", cancelar: '1'} 
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result == 1) {
            let data = this.reactiveForm.value
            data.loginEcodUsuarios= localStorage.getItem('loginEcodUsuarios');
            this._service.postRegistro(data).then((response:any)=>{
              this.datos.ecodUsuario = response.codigo;
              this.datos.exito = response.exito;
              let dialogRef = this.dialog.open(GuardarComponent, {
                width: '450px',
                data: { titulo: response.exito == 1 ? "Éxito " : "Error", subtitulo: response.exito == 1 ? "La información se guardó exitosamente " : "Ocurrio un error al guardar" }
              });
              if (this.datos.exito == 1) {
                dialogRef.afterClosed().subscribe(result => {
                  this._service.getDetalle(this.datos.ecodUsuario).then((response:any)=>{
      
                    let dialogRef = this.dialog.open(UsuarioDetallesComponent, {
                      data: { titulo: "Detalle de usuario",usuario:response.sql, relcelres:response.relcelres,relMailres:response.relMailres}
                    });
                    dialogRef.afterClosed().subscribe(result => { 
                      this.router.navigate(['Catalogo/usuarios/Consulta']);      
                    });
                  }).catch((error)=>{});
                 
                });
              }
            }).catch((error)=>{});
          }
        });
      }
    }
  }

  ConsultaUsuario(){
    this.router.navigate(['Catalogo/usuarios/Consulta']);
  }
  submit() {
      console.log(this.reactiveForm.value); 
  }
}
