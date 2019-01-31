import { Component, OnInit, Input } from '@angular/core';
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
  public loading = true;
  public commentsLoading = true;

  public commentPeriod: CommentPeriod;
  public comments: Comment[];

  public commentPeriodHeader: String;
  public totalComments = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  private commentPeriodId = '';

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
            // To fix the issue where the last page is empty.
            this.totalComments = Math.floor(data.commentPeriod.totalComments / data.commentPeriod.pageSize) * data.commentPeriod.pageSize;
            this.commentPeriod = data.commentPeriod;
            this.commentPeriodHeader = this.commentPeriod.commentPeriodStatus === 'Completed' ? 'Public Comment Period is Now Closed' : 'Public Comment Period is Now Open';
            this.loading = false;

            this.updateUrl();

            this.commentPeriodId = this.commentPeriod._id;
            this.getPaginatedComments(this.commentPeriod.currentPage);
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to project list
            this.router.navigate(['/projects']);
          }
        }
      );
  }

  getPaginatedComments(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    this.commentsLoading = true;
    this.commentService.getByPeriodId(this.commentPeriodId, pageNumber, this.commentPeriod.pageSize)
    .takeUntil(this.ngUnsubscribe)
    .subscribe((data) => {
      this.commentPeriod.currentPage = pageNumber;
      this.updateUrl();
      this.comments = data['currentComments'];
      this.commentsLoading = false;
    });
  }

  updateUrl() {
    let currentUrl = this.router.url;
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.commentPeriod.currentPage}&pageSize=${this.commentPeriod.pageSize}`;
    window.history.replaceState({}, '', currentUrl);
  }

  // private viewDetails(commentId: string) {
  //   this.dialogService.addDialog(ViewCommentComponent,
  //     {
  //       commentId: commentId
  //     }, {
  //       // index: 0,
  //       // autoCloseTimeout: 10000,
  //       // closeByClickingOutside: true,
  //       backdropColor: 'rgba(0, 0, 0, 0.5)'
  //     })
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe((isConfirmed) => {
  //       // // we get dialog result
  //       // if (isConfirmed) {
  //       //   // TODO: reload page?
  //       //   console.log('saved');
  //       // } else {
  //       //   console.log('canceled');
  //       // }
  //     });
  // }
}
