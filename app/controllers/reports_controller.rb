class ReportsController < ApplicationController
  def new
    @coffee_shop = CoffeeShop.find(params[:coffee_shop_id])
  end

  def create
    coffee_shop = CoffeeShop.find_by(id: params[:coffee_shop_id])

    message = [
      "Coffee Shop ID: #{coffee_shop&.id}",
      "Coffee Shop Name: #{coffee_shop&.name}",
      "Email: #{params[:email] || "N/A"}",
      "Report: #{params[:message] || "N/A"}",
      "Submitted at: #{Time.current}"
    ].join("\n")

    TelegramNotifierWorker.perform_async(message)
  end
end
