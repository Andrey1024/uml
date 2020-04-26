import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {Store} from "@ngxs/store";
import {Create} from "../../state/commits.state";
import {Router} from "@angular/router";

@Component({
  selector: 'uml-add-repository-dialog',
  templateUrl: './add-repository-dialog.component.html',
  styleUrls: ['./add-repository-dialog.component.scss']
})
export class AddRepositoryDialogComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl(""),
    url: new FormControl("")
  })

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
  }

  addRepo() {
    const value = this.form.value;
    this.store.dispatch(new Create(value.name, value.url)).subscribe(() => {
      this.router.navigate([value.name])
    })
  }
}
