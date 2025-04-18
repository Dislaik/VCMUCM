import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Resource } from '../../architecture/model/resource';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceService } from '../../architecture/service/resource.service';
import { Utils } from '../../app.utils';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { UserService } from '../../architecture/service/user.service';
import { User } from '../../architecture/model/user';

@Component({
  selector: 'app-manage-resource-details',
  standalone: false,
  templateUrl: './manage-resource-details.component.html',
  styleUrl: './manage-resource-details.component.css'
})
export class ManageResourceDetailsComponent implements OnInit {
  title: string = "Detalles del recurso";
  id: number;
  pages: string;
  isViewLoaded: boolean = false;
  enableEditItem: boolean = false;
  browserUser: User;

  @ViewChild('inputItemEditName') inputItemEditName: ElementRef;
  nameError: string = '';
  @ViewChild('inputItemEditLabel') inputItemEditLabel: ElementRef;
  labelError: string = '';
  @ViewChild('inputItemEditDescription') inputItemEditDescription: ElementRef;
  @ViewChild('inputItemEditPrice') inputItemEditPrice: ElementRef;

  resource: Resource;


  constructor(
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private resourceService: ResourceService,
    private activatedRoute: ActivatedRoute
  ){
    this.activatedRoute.params.subscribe( params =>
      this.id = params['id']
    );
  }

  public ngOnInit(): void {
    this.createBreadCrumb();
    this.getUserByBrowser();
    this.getResource();
  }

  private createBreadCrumb(): void {
    const arrayPages: { [i: number]: { page: string; url: string } } = {
      1: {page: 'Inicio', url: '/'},
      2: {page: 'Panel de administración', url: '/panel'},
      3: {page: 'Recursos', url: '/panel/resource'},
      4: {page: this.title, url: this.router.url},
    };
    this.pages = JSON.stringify(arrayPages);
  }

  private async getUserByBrowser(): Promise<void> {
    const browserUser = Utils.getUsernameByBrowser();
    const response = await this.userService.getByUsername(browserUser);

    if (response.ok) {
      this.browserUser = response.message;
    } else {
      console.log(response.error)
    }
  }

  private async getResource(): Promise<void> {
    const response = await this.resourceService.getById(this.id);

    if (response.ok) {
      this.resource = response.message;
      this.isViewLoaded = true;
    } else {
      console.log(response.error);
    }
  }

  public ngOnEditItem(): void {
    this.enableEditItem = true;
    setTimeout(() => {
      if (this.inputItemEditName) {
        this.inputItemEditName.nativeElement.value = this.resource.name;
      }

      if (this.inputItemEditLabel) {
        this.inputItemEditLabel.nativeElement.value = this.resource.label;
      }

      if (this.inputItemEditDescription) {
        this.inputItemEditDescription.nativeElement.value = this.resource.description;
      }

      if (this.inputItemEditPrice) {
        this.inputItemEditPrice.nativeElement.value = Utils.stringToPrice(String(this.resource.price));
      }
    });
  }

  public async ngOnEditItemSave(): Promise<void> {
    const name = this.inputItemEditName.nativeElement.value;
    const label = this.inputItemEditLabel.nativeElement.value;
    const description = this.inputItemEditDescription.nativeElement.value;
    const price = this.inputItemEditPrice.nativeElement.value;
    let success = 0;

    if (name.trim() === '') {
      this.nameError = 'Debe ingresar un identificador';
    } else {
      this.nameError = '';
      success+= 1;
    }

    if (label.trim() === '') {
      this.labelError = 'Debe ingresar una etiqueta';
    } else {
      this.labelError = '';
      success+= 1;
    }

    if (success === 2) {
      const resource = new Resource(name, label, description, this.priceToNumber(price));
      const response = await this.resourceService.update(this.resource.id, resource);

      if (response.ok) {
        this.toastr.success('Se han guardado los cambios con exito');
        this.resource = response.message;
        this.enableEditItem = false;
      } else {
        if (Object.keys(response.error.error).length > 0) {
          this.nameError = response.error.error.name;
        }
      }
    }
  }

  public ngOnEditItemCancel(): void {
    this.enableEditItem = false;
    this.nameError = '';
    this.labelError = '';
  }

  public ngOnDeleteItem(): void {
    Swal.fire({
      title: '¿Estas seguro que quieres eliminar este recurso?',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await this.resourceService.delete(this.resource.id)

        if (response.ok) {
          Swal.fire('Recurso eliminado', '', 'success');

          this.router.navigate(['/panel/resource']);
        } else {
          if (response.error.error.name == 'SequelizeForeignKeyConstraintError') {
            Swal.fire('El recurso no puede ser eliminado debido a tablas relacionadas', '', 'warning');
          }
        }
      }
    }); 
  }

  public nameIdentifier(): void {
    Utils.formatNameIdentifier(this.inputItemEditName.nativeElement);
  }

  public priceCLP(): void {
    Utils.formatCLP(this.inputItemEditPrice.nativeElement);
  }

  public priceToNumber(p1: string): number {
    return Utils.priceToNumber(p1);
  }
  

  public numberToPrice(p1: number): string {
    if (p1 === 0) {
      return "Gratis"
    }

    return '$' + Utils.stringToPrice(String(p1));
  }

  public checkDescription(p1: string): string {
    if (p1.trim() === '') {
      return "Sin descripción";
    }

    return p1;
  }

  public UTCToChileTime(p1: Date, p2: boolean): string {
    return Utils.convertToChileTime(p1, p2);
  }

  public haveRole(p1: any[]) {
    
    if (this.browserUser) {
      if (Utils.haveRole(this.browserUser, p1)) {
        return true
      }
    }

    return false
  }
}
