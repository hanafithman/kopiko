class GoogleApi::GoogleLocationSyncWorker < SidekiqWorker
  sidekiq_options retry: 2

  def perform(google_location_id)
    google_location = GoogleLocation.find(google_location_id)

    result =
      GoogleApi::GoogleLocationSyncer.call(google_location: google_location)

    raise(result.failure) if result.failure?
  end
end
