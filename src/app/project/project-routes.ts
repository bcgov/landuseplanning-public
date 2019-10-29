import { Routes } from '@angular/router';

import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';
import { BackgroundInfoTabComponent } from './background-info-tab/background-info-tab.component';
import { CommentsComponent } from './comments/comments.component';
import { DocumentsTabComponent } from './documents/documents-tab.component';
import { DocumentsResolver } from './documents/documents-resolver.service';
import { ProjectDetailsTabComponent } from './project-details-tab/project-details-tab.component';
import { ProjectActivitesComponent } from './project-activites/project-activites.component';
import { ProjectActivitiesResolver } from './project-activites/project-activities-resolver.service';
import { ProjectPhaseTabComponent } from './project-phase-tab/project-phase-tab.component';
import { DocumentTableResolver } from './documents/project-document-table-rows/project-document-table-rows-resolver.service';
import { CertificatesResolver } from './certificates/certificates-resolver.service';
import { CertificatesComponent } from './certificates/certificates.component';
import { AmendmentsResolverService } from './certificates/amendments-resolver.service';
import { PinsComponent } from './pins/pins.component';
import { PinsResolverService } from './pins/pins-resolver.service';
import { ShapeFileResolver } from './project-details-tab/project-shapefile-resolver.service';

export const ProjectRoutes: Routes = [
  {
    path: '',
    redirectTo: 'project-details',
    pathMatch: 'full'
  },
  {
    path: 'project-details',
    component: ProjectDetailsTabComponent,
    resolve: {
      documents: ProjectActivitiesResolver,
      shapefile: ShapeFileResolver
    }
  },
  {
    path: 'certificates',
    component: CertificatesComponent,
    resolve: {
      documents: CertificatesResolver,
      documentsTableRow: DocumentTableResolver
    }
  },
  {
    path: 'project-phase',
    component: ProjectPhaseTabComponent,
  },
  {
    path: 'pins',
    component: PinsComponent,
    resolve: {
      pins: PinsResolverService
    }
  },
  {
    path: 'commenting',
    component: CommentingTabComponent
  },
  {
    path: 'documents',
    component: DocumentsTabComponent,
    resolve: {
      documents: DocumentsResolver,
      documentsTableRow: DocumentTableResolver
    }
  },
  {
    path: 'decisions',
    component: DecisionsTabComponent
  },
  {
    path: 'background-info',
    component: BackgroundInfoTabComponent
  },
  {
    path: 'cp',
    component: CommentsComponent
  }
];
