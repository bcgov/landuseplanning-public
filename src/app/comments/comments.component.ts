import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { CommentPeriod } from 'app/models/commentperiod';

import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  public commentPeriod: CommentPeriod = null;
  public commentPeriodHeader: String;
  public comments: Comment[];
  public loading = true;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private router: Router,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { commentPeriod: CommentPeriod }) => {
          if (data.commentPeriod) {
            this.commentPeriod = data.commentPeriod;
            this.commentPeriodHeader = this.commentPeriod.commentPeriodStatus === 'Completed' ? 'Public Comment Period is Now Closed' : 'Public Comment Period is Now Open';
            this.loading = false;
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }
}
