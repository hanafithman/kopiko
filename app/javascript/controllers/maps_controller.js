import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    coffeeShopName: String
  }

  static targets = [
    "googlePlaceId",
    "latitude",
    "locationContainer",
    "locationInput",
    "locationMap",
    "longitude",
    "placeContainer",
    "placeInput",
    "placeMapContainer",
  ]

  klccCoordinates = { lat: 3.1578, lng: 101.7119 }

  connect() {
    if (typeof (google) != "undefined"){
      this.initializeMap()
    }
  }

  initializeMap() {
    this.placeMap()
    this.placeMarker()
    this.placeAutoComplete()

    this.locationMap()
    this.locationMarker()
    this.locationAutoComplete()
  }

  placeMap() {
    if (this._placeMap != undefined || !this.hasPlaceMapContainerTarget) {
      return this._placeMap
    }

    // Prefill some values for editing
    const initialZoom = this.placeInputTarget.value ? 17 : 13
    this.placeInputTarget.value = this.coffeeShopNameValue

    this._placeMap = new google.maps.Map(this.placeMapContainerTarget, {
      center: this._initialLocation(),
      zoom: initialZoom,
      disableDefaultUI: true,
      zoomControl: true,
    })

    this._placeMap.controls[google.maps.ControlPosition.TOP_LEFT].push(
      // Doesn't work with target when navigating in/out of page
      // Turbo problem? Connected more than once in a single click
      document.getElementById("maps-place-input")
    )

    return this._placeMap
  }

  placeMarker() {
    if (this._placeMarker != undefined) { return this._placeMarker }

    this._placeMarker = new google.maps.Marker({ map: this.placeMap() })

    return this._placeMarker
  }

  placeAutoComplete() {
    if (this._placeAutoComplete != undefined || !this.hasPlaceInputTarget) {
      return this._placeAutoComplete
    }

    this._placeAutoComplete =
      new google.maps.places.Autocomplete(this.placeInputTarget, {
        componentRestrictions: { country: "my" },
        fields: ["place_id", "geometry"],
      })

    this._placeAutoComplete.bindTo("bounds", this.placeMap())

    this._placeAutoComplete.addListener("place_changed", () => {
      const place = this._placeAutoComplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        return
      }

      if (place.geometry.viewport) {
        this.placeMap().fitBounds(place.geometry.viewport)
      } else {
        this.placeMap().setCenter(place.geometry.location)
        this.placeMap().setZoom(17)
      }

      this.placeMarker().setPlace({
        placeId: place.place_id,
        location: place.geometry.location,
      })
      this.placeMarker().setVisible(true)

      this.googlePlaceIdTarget.value = place.place_id
      this.latitudeTarget.value = place.geometry.location.lat()
      this.longitudeTarget.value = place.geometry.location.lng()
    })

    return this._placeAutoComplete
  }

  locationMap() {
    if (this._locationMap != undefined || !this.hasLocationMapTarget) {
      return this._locationMap
    }

    this._locationMap = new google.maps.Map(this.locationMapTarget, {
      center: this.klccCoordinates,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
    })

    this._locationMap.controls[google.maps.ControlPosition.TOP_LEFT].push(
      // Doesn't work with target when navigating in/out of page
      // Turbo problem? Connected more than once in a single click
      document.getElementById("maps-location-input")
    )

    return this._locationMap
  }

  locationMarker() {
    if (this._locationMarker != undefined) { return this._locationMarker }

    this._locationMarker =
      new google.maps.Marker({ map: this.locationMap(), draggable: true })
    this._locationMarker.addListener("dragend", (e) => {
      this.latitudeTarget.value = e.latLng.lat()
      this.longitudeTarget.value = e.latLng.lng()
    })

    return this._locationMarker
  }

  locationAutoComplete() {
    if (this._locationAutoComplete != undefined || !this.hasLocationInputTarget) {
      return this._locationAutoComplete
    }

    this._locationAutoComplete =
      new google.maps.places.Autocomplete(this.locationInputTarget, {
        componentRestrictions: { country: "my" },
        fields: ["geometry"],
      })

    this._locationAutoComplete.bindTo("bounds", this.locationMap())

    this.locationMap().addListener("click", (e) => {
      this.locationMarker().setPosition(e.latLng)

      this.latitudeTarget.value = e.latLng.lat()
      this.longitudeTarget.value = e.latLng.lng()
    })

    this._locationAutoComplete.addListener("place_changed", () => {
      const place = this._locationAutoComplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        return
      }

      if (place.geometry.viewport) {
        this.locationMap().fitBounds(place.geometry.viewport)
      } else {
        this.locationMap().setCenter(place.geometry.location)
        this.locationMap().setZoom(17)
      }

      this.locationMarker().setPosition(place.geometry.location)
      this.locationMarker().setVisible(true)

      this.latitudeTarget.value = place.geometry.location.lat()
      this.longitudeTarget.value = place.geometry.location.lng()
    })
  }

  preventSubmit(e) {
    if (e.key == "Enter") { e.preventDefault() }
  }

  _initialLocation() {
    if (this.latitudeTarget.value && this.longitudeTarget.value) {
      return {
        lat: parseFloat(this.latitudeTarget.value),
        lng: parseFloat(this.longitudeTarget.value),
      }
    } else {
      return this.klccCoordinates
    }
  }

  _resetMap() {
    this.placeInputTarget.value = ""
    this.locationInputTarget.value = ""
    this.googlePlaceIdTarget.value = ""
    this.latitudeTarget.value = ""
    this.longitudeTarget.value = ""

    this.placeMarker().setVisible(false)
    this.locationMarker().setVisible(false)
  }

  toggleLocation(e) {
    e.preventDefault()

    this._resetMap()

    this.locationContainerTarget.classList.toggle("hidden")
    this.placeContainerTarget.classList.toggle("hidden")
  }
}
