import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { SearchService } from 'app/services/search.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    const searchServiceStub = {
        getTopNewsItems() {
            return {
                takeUntil() {
                    return {
                        subscribe(callback: (value: unknown) => void) {
                            callback([]);
                        }
                    };
                }
            };
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HomeComponent],
            imports: [RouterTestingModule],
            providers: [{ provide: SearchService, useValue: searchServiceStub }]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
