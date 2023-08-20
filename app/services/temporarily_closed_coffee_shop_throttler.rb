class TemporarilyClosedCoffeeShopThrottler
  MESSAGE = "Temporarily closed"
  TIME_LIMIT = 1.week.ago

  def initialize(coffee_shop:)
    @coffee_shop = coffee_shop
  end

  def self.allowed?(coffee_shop:)
    new(coffee_shop: coffee_shop).allowed?
  end

  def allowed?
    last_synced =
      SyncLog
        .where(syncable: @coffee_shop, message: MESSAGE)
        .order(created_at: :desc)
        .first

    return true if last_synced.nil?
    return true if last_synced.created_at < TIME_LIMIT

    false
  end
end