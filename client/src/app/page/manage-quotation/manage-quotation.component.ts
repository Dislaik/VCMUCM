import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Quotation } from '../../architecture/model/quotation';
import { QuotationService } from '../../architecture/service/quotation.service';
import { Utils } from '../../app.utils';

@Component({
  selector: 'app-manage-quotation',
  standalone: false,
  templateUrl: './manage-quotation.component.html',
  styleUrl: './manage-quotation.component.css'
})
export class ManageQuotationComponent implements OnInit {
  title: string = "Cotizaciones";
  pages: string;
  isViewLoaded: boolean = false;

  @ViewChild('modalCreateItem') modalCreateItem: ElementRef;
  modalCreateItemInstance: any;
  @ViewChild('inputSearchItem') inputSearchItem: ElementRef;


  quotations: Quotation[];

  //// PAGINATION VARIABLES ////
  pagination: number;
  paginationItems: any[]
  paginationShowItems: any[];
  paginationLengh: number;
  paginationMax: number;
  paginationList: number[];
  paginationListShow: number[];
  paginationRow: number;
  isNavigationContainFirstPage: boolean;
  isNavigationContainLastPage: boolean;
  isOnFilter: boolean;
  //// PAGINATION VARIABLES ////

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private quotationService: QuotationService
  ) {}

  public ngOnInit(): void {
    this.createBreadCrumb();
    this.ngOnCreatePagination(1, 10);
  }

  private createBreadCrumb(): void {
    const arrayPages: { [i: number]: { page: string; url: string } } = {
      1: {page: 'Inicio', url: '/'},
      2: {page: 'Panel de administración', url: '/panel'},
      3: {page: this.title, url: this.router.url},
    };
    this.pages = JSON.stringify(arrayPages);
  }

  private async getAllQuotations(): Promise<Quotation[]> {
    const response = await this.quotationService.getAll();

    if (response.ok) {
      console.log(response.message)
      return response.message
    } else {
      console.log(response.error)
    }

    return [];
  }

  ///// PAGINATION START /////

  private async ngOnCreatePagination(p1: number, p2: number): Promise<void> {
    this.quotations = await this.getAllQuotations();
    this.paginationItems = this.quotations;
    this.pagination = p1;
    this.paginationRow = p2;
    this.ngOnStartPagination(this.paginationItems);
    this.isNavigationContainFirstPage = false;
    
    if (this.paginationMax < 4) {
      this.isNavigationContainLastPage = true;
    } else {
      this.isNavigationContainLastPage = false;
    }

    this.isOnFilter = false;
    this.isViewLoaded = true;
  }

  private ngOnStartPagination(p1: any[]): void {
    this.ngOnShowPage(p1, this.pagination)
    this.paginationMax = this.getTotalPages(p1, this.paginationRow)
    this.paginationList = this.createRange(this.paginationMax);
    this.paginationListShow = this.paginationList.slice(0, 3);
  }

  public ngOnClearSearchItem(): void {
    this.inputSearchItem.nativeElement.value = '';
    this.pagination = 1;
    this.toastr.info('Se ha eliminado el filtrado');
    this.isOnFilter = false;
    this.paginationItems = this.quotations;
    this.ngOnStartPagination(this.paginationItems);
    this.ngOnNavigationStartEndPages();
  }

  public ngOnSearchItem(): void {
    const search = this.inputSearchItem.nativeElement.value;

    if (search === '') {
      this.pagination = 1;
      this.paginationItems = this.quotations;
      this.ngOnStartPagination(this.paginationItems);
      this.ngOnNavigationStartEndPages();
      this.toastr.info('Se ha eliminado el filtrado');
      this.isOnFilter = false;
    } else {
      this.pagination = 1;
      this.paginationItems = this.ngOnFilterPaginationItems(search);
      this.ngOnStartPagination(this.paginationItems);
      this.ngOnNavigationStartEndPages();
      this.toastr.info('Se ha aplicado el filtrado');
      this.isOnFilter = true;
    }

    this.ngOnNavigationStartEndPages();
  }

  private ngOnFilterPaginationItems(p1: string): any[] {
    return this.quotations.filter(resource =>
      String(resource.id).toLowerCase().includes(p1.toLowerCase())
      // resource.name.toLowerCase().includes(p1.toLowerCase()) ||
      // resource.label.toLowerCase().includes(p1.toLowerCase()) ||
      // resource.description.toLowerCase().includes(p1.toLowerCase()) ||
      // String(resource.price).toLowerCase().includes(p1.toLowerCase())
    );
  }

  public ngOnItemDetails(p1: any): void {
    this.router.navigate(['/panel/quotation', p1.id]);
  }

  public ngOnPaginationNext(): void {
    this.pagination += 1;

    this.ngOnShowPage(this.paginationItems, this.pagination)
    if (this.pagination >= 3 && this.pagination < this.paginationMax) {
      const newPaginationList = this.paginationListShow.map(page => page + 1);
      this.paginationListShow = newPaginationList
    }

    this.ngOnNavigationStartEndPages();
  }

  public ngOnPaginationBack(): void {
    this.pagination -= 1;

    this.ngOnShowPage(this.paginationItems, this.pagination)
    
    if (this.pagination >= 2 && this.pagination !== this.paginationMax - 1) {
      const newPaginationList = this.paginationListShow.map(page => page - 1);
      this.paginationListShow = newPaginationList
    }

    this.ngOnNavigationStartEndPages();
  }

  public ngOnPaginationItem(p1: number): void {
    this.ngOnShowPage(this.paginationItems, p1)

    if (p1 === 1) {
      const firstElement = this.paginationListShow[0];
      const asd = firstElement - 1;
      const newPaginationList = this.paginationListShow.map(page => page - asd);

      this.paginationListShow = newPaginationList;
    } else if (this.pagination > p1) {
      if (p1 >= 2 && p1 !== this.paginationMax - 1) {
        const newPaginationList = this.paginationListShow.map(page => page - 1);
        this.paginationListShow = newPaginationList
      }
    } else if (p1 === this.paginationMax) {
      const lastElement = this.paginationListShow[this.paginationListShow.length - 1];
      const asd = this.paginationMax - lastElement; 
      const newPaginationList = this.paginationListShow.map(page => page + asd);

      this.paginationListShow = newPaginationList
    } else {
      if (p1 >= 3 && p1 < this.paginationMax) {
        const newPaginationList = this.paginationListShow.map(page => page + 1);
        this.paginationListShow = newPaginationList
      }
    }

    this.ngOnNavigationStartEndPages();

    this.pagination = p1;
  }

  private ngOnShowPage(p1: any[], p2: number): void {
    const start = (p2 - 1) * this.paginationRow;
    const end = start + this.paginationRow;
    
    this.paginationShowItems = p1.slice(start, end);
    this.paginationLengh = this.paginationShowItems.length;
  }

  private ngOnNavigationStartEndPages(): void {
    if (this.paginationListShow.includes(this.paginationMax)) {
      this.isNavigationContainLastPage = true;
    } else {
      this.isNavigationContainLastPage = false;
    }

    if (this.paginationListShow.includes(1)) {
      this.isNavigationContainFirstPage = true;
    } else {
      this.isNavigationContainFirstPage = false;
    }
  }

  private getTotalPages(p1: any[], p2: number): number {
    if (p1.length === 0) {
      return 1;
    }
    
    return Math.ceil(p1.length / p2);
  }

  private createRange(number){
    return new Array(number).fill(0).map((n, index) => index + 1);
  }

  ///// PAGINATION END /////
  

  public UTCToChileTime(p1: Date, p2: boolean): string {
    return Utils.convertToChileTime(p1, p2);
  }

  public numberToPrice(p1: number): string {
    if (p1 === 0) {
      return "Sin costos"
    }

    return '$' + Utils.stringToPrice(String(p1));
  }

}
