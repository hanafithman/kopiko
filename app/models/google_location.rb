class GoogleLocation < ApplicationRecord
  belongs_to :coffee_shop

  after_save :sync_with_google

  def sync_with_google
    keys = ["place_id", "lat", "lng"]

    return unless saved_changes.keys.any? { |key| keys.include?(key) }

    GoogleApi::GoogleLocationSyncWorker.perform_async(id)
  end
end
