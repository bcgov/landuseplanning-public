import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { CommentPeriod } from 'app/models/commentperiod';
import { Comment } from 'app/models/comment';

import { CommentService } from 'app/services/comment.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DialogService } from 'ng2-bootstrap-modal';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  public loading = true;
  public commentsLoading = true;

  public commentPeriod: CommentPeriod;
  public comments: Comment[];

  public commentPeriodHeader: String;
  public currentPage = 1;
  public pageSize = 10;
  public totalComments = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private commentPeriodId = '';

  public listType = 'comments';

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private dialogService: DialogService,
    private router: Router,
    public commentPeriodService: CommentPeriodService
  ) { }

  ngOnInit() {
    // Get page size and current page from url
    this.route.queryParams.subscribe(params => {
      this.currentPage = Number(params['currentPage'] ? params['currentPage'] : 1);
      this.pageSize = Number(params['pageSize'] ? params['pageSize'] : 10);
    });

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { commentPeriod: CommentPeriod }) => {
          if (data.commentPeriod) {
            // To fix the issue where the last page is empty.
            this.commentPeriod = data.commentPeriod;
            this.commentPeriodHeader = this.commentPeriod.commentPeriodStatus === 'Completed' ? 'Public Comment Period is Now Closed' : 'Public Comment Period is Now Open';
            this.loading = false;

            this.updateUrl();

            this.commentPeriodId = this.commentPeriod._id;
            this.getPaginatedComments(this.currentPage);
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  public getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.commentsLoading = true;
    this.commentService.getByPeriodId(this.commentPeriodId, pageNumber, this.pageSize, true)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        this.totalComments = Math.floor(data['totalCount'] / this.pageSize) * this.pageSize;
        this.currentPage = pageNumber;
        this.updateUrl();
        this.comments = data['currentComments'];
        this.commentsLoading = false;
      });
  }

  updateUrl() {
    let currentUrl = this.router.url;
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    window.history.replaceState({}, '', currentUrl);
  }
}
