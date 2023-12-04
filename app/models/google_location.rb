class GoogleLocation < ApplicationRecord
  belongs_to :coffee_shop

  validate :location_is_correct

  after_save :sync_with_google

  private

  def location_is_correct
    if lat.blank? || lng.blank?
      errors.add(:base, "missing lat/lng coordinates")
    end
  end

  def sync_with_google
    keys = ["place_id", "lat", "lng"]

    return unless saved_changes.keys.any? { |key| keys.include?(key) }

    GoogleApi::GoogleLocationSyncWorker.perform_async(id)
  end
end
