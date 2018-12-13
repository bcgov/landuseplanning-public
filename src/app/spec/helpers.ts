import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';


export class ActivatedRouteStub {
  public parent = {
    data: Observable.of({})
  };

  constructor(initialData) {
    this.setParentData(initialData);
  }

  public setParentData(data: {}) {
    this.parent.data = Observable.of(data);
  }
}

export default ActivatedRouteStub;
