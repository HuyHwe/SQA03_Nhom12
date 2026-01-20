
import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})

export class Breadcrumb implements OnInit {
	@Input() key :string
	@Input() link :string
	
	ngOnInit(): void {

	}
}