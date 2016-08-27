import {Component, Input, ViewChild} from "@angular/core";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {StationModel} from "../../../../stations/StationModel";
import {List} from 'immutable';
import {StationsMap} from "../../dashboard/StationsMap";
import {AppStore} from "angular2-redux-util";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import {MapAddress} from "../../../mapaddress/MapAddress";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import * as _ from 'lodash';

@Component({
    selector: 'AdnetLocation',
    moduleId: __moduleName,
    template: `<MapAddress #mapAddress (onChange)="onUpdatedStationCoords($event)"></MapAddress>
               <stationsMap #stationsMap (onMapClicked)="onUpdatedStationCoords($event)" 
                   *ngIf="stationComponentMode=='map'" [stations]="stations">
               </stationsMap>`
})

export class AdnetLocation {

    constructor(private appStore: AppStore, private adnetAction: AdnetActions) {
        // this.unsub = this.appStore.sub((i_adTargets: List<AdnetTargetModel>) => {
        //     this.onUpdateMap();
        // }, 'adnet.targets');
    }

    @ViewChild(StationsMap)
    stationsMap: StationsMap;

    @ViewChild(MapAddress)
    mapAddress: MapAddress;

    @Input()
    set adnetTargetModel(i_adnetTargetModel: AdnetTargetModel) {
        if (!i_adnetTargetModel){
            this.stations = null;
            if (this.stationsMap)
                this.stationsMap.clear();
            this.mapAddress.clear();
            return;
        }
        this.selectedAdnetTargetModel = i_adnetTargetModel;
        this.onUpdateMap();
    }

    @Input()
    set activated(value) {
        if (value)
            this.stationComponentMode = 'map';
    }

    @Input()
    adnetCustomerModel: AdnetCustomerModel

    private onUpdateMap(){
        var lat = this.selectedAdnetTargetModel ? this.selectedAdnetTargetModel.getCoordinates().lat : 0;
        var lon = this.selectedAdnetTargetModel ? this.selectedAdnetTargetModel.getCoordinates().lng : 0;
        var name = this.selectedAdnetTargetModel ? this.selectedAdnetTargetModel.getName() : '';

        var stationData = {
            businessId: this.adnetCustomerModel.customerId(),
            id: _.uniqueId(),
            geoLocation: {
                lat: lat,
                lon: lon
            },
            source: -1,
            airVersion: -1,
            appVersion: -1,
            caching: -1,
            localIp: -1,
            publicIp: -1,
            cameraStatus: -1,
            connection: -1,
            lastCameraTest: -1,
            lastUpdate: -1,
            name: name,
            os: '',
            peakMemory: '',
            runningTime: '',
            socket: '',
            startTime: '',
            status: '',
            totalMemory: '',
            watchDogConnection: ''
        };
        this.stations = List<StationModel>();
        var stationModel: StationModel = new StationModel(stationData)
        this.stations = this.stations.push(stationModel);
        if (this.stationsMap) {
            this.stationsMap.setCenter(stationModel.getLocation().lat, stationModel.getLocation().lon);
        }
    }

    private onUpdatedStationCoords(event) {
        var payload = this.selectedAdnetTargetModel.getKey('Value');
        payload.locationLat = event['coords'].lat;
        payload.locationLng = event['coords'].lng;
        this.appStore.dispatch(this.adnetAction.saveTargetInfo(payload, this.selectedAdnetTargetModel.getId()))
    }

    private stationComponentMode: string;
    private unsub:Function;
    private stations: List<StationModel> = List<StationModel>();
    private selectedAdnetTargetModel: AdnetTargetModel;

    private ngOnDestroy() {
        this.unsub();
    }
}