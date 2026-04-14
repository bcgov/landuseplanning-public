import { Routes } from '@angular/router';

import { CommentingTabComponent } from './commenting-tab/commenting-tab.component';
import { DecisionsTabComponent } from './decisions-tab/decisions-tab.component';
import { BackgroundInfoTabComponent } from './background-info-tab/background-info-tab.component';
import { CommentsComponent } from './comments/comments.component';
import { DocumentsTabComponent } from './documents/documents-tab.component';
import { DocumentsResolver } from './documents/documents-resolver.service';
import { ProjectPhaseTabComponent } from './project-phase-tab/project-phase-tab.component';
import { DocumentTableResolver } from './documents/project-document-table-rows/project-document-table-rows-resolver.service';
import { CertificatesResolver } from './certificates/certificates-resolver.service';
import { CertificatesComponent } from './certificates/certificates.component';
import { PinsComponent } from './pins/pins.component';
import { PinsResolverService } from './pins/pins-resolver.service';
import { EmailSubscribeComponent } from './email-subscribe/email-subscribe.component';

export const ProjectRoutes: Routes = [
  {
    path: 'certificates',
    component: CertificatesComponent,
    resolve: {
      documents: CertificatesResolver,
      documentsTableRow: DocumentTableResolver
    },
    data: {
      title: 'Certificates',
      focush1: false,
      description: 'View certificates and related documents for this project.'
    }
  },
  {
    path: 'project-phase',
    component: ProjectPhaseTabComponent,
    data: {
      title: 'Project Phase',
      focush1: false,
      description: 'Current phase information for this project.'
    }
  },
  {
    path: 'pins',
    component: PinsComponent,
    resolve: {
      pins: PinsResolverService
    },
    data: {
      title: 'Project Pins',
      focush1: false,
      description: 'Important pinned information and updates for this project.'
    }
  },
  {
    path: 'commenting',
    component: CommentingTabComponent,
    data: {
      title: 'Project Comments',
      focush1: false,
      description: 'View and submit comments on this project during open comment periods.'
    }
  },
  {
    path: 'documents',
    component: DocumentsTabComponent,
    resolve: {
      documents: DocumentsResolver,
      documentsTableRow: DocumentTableResolver
    },
    data: {
      title: 'Project Documents',
      focush1: false,
      description: 'Access project documents, reports, and supporting materials for this planning engagement.'
    }
  },
  {
    path: 'decisions',
    component: DecisionsTabComponent,
    data: {
      title: 'Project Decisions',
      focush1: false,
      description: 'View decisions and determinations made for this project.'
    }
  },
  {
    path: 'background-info',
    component: BackgroundInfoTabComponent,
    data: {
      title: 'Project Background Information',
      focush1: false,
      description: 'Background information, context, and history for this project.'
    }
  },
  {
    path: 'email-subscribe',
    component: EmailSubscribeComponent,
    data: {
      title: 'Email Subscribe',
      focush1: false,
      description: 'Subscribe to email updates and notifications for this project.',
      robots: 'noindex, follow'
    }
  },
  {
    path: 'cp',
    component: CommentsComponent,
    data: {
      title: 'Project Comments',
      focush1: true,
      description: 'Submit your comments and feedback on this project.'
    }
  }
];
