import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Project } from 'app/models/project';

describe('ProjectComponent', () => {

  const existingProject = new Project();

  const activatedRouteStub = {
    data: Observable.of({project: existingProject}),
    snapshot: {}
  };
});
