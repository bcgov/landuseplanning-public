import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationMapComponent } from './application-map.component';

describe('ApplicationMapComponent', () => {
    let component: ApplicationMapComponent;
    let fixture: ComponentFixture<ApplicationMapComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ApplicationMapComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ApplicationMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
