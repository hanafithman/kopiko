class CoffeeShops::LocationsController < ApplicationController
  def edit
    @coffee_shop =
      current_user.coffee_shops.find_by(slug: params[:coffee_shop_id]) ||
      current_user.coffee_shops.find(params[:coffee_shop_id].to_i)
  end

  def update
  end
end
