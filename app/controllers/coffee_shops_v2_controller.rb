class CoffeeShopsV2Controller < ApplicationController
  def new
    @coffee_shop = CoffeeShop.new
  end

  def create
  end

  private
end
