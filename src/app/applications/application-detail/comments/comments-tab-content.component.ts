import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Application } from 'app/models/application';
import { Comment } from 'app/models/comment';
import { CommentService } from 'app/services/comment.service';

@Component({
  selector: 'app-comments-tab-content',
  templateUrl: './comments-tab-content.component.html',
  styleUrls: ['./comments-tab-content.component.scss']
})
export class CommentsTabContentComponent implements OnInit, OnDestroy {
  public loading: boolean;
  public comments: Array<Comment>;
  private sub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.comments = new Array<Comment>();

    this.sub = this.route.parent.data.subscribe(
      (data: { application: Application }) => {
        if (data.application) {
          this.commentService.getAllByApplicationId(data.application._id).subscribe(
            comments => {
              comments.forEach(comment => {
                this.comments.push(comment);
              });
            },
            error => console.log(error)
          );
        }
      },
      error => console.log(error),
      () => this.loading = false
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
