defmodule Tags.Tags.Count do
  alias Tags.Messages.Get

  def call do
    Get.today_messages()
    |> Task.async_stream(&count_word(&1.message))
    |> Enum.reduce(%{}, &sum_values(&1, &1))
  end

  defp count_word(message) do
    message
    |> String.split()
    |> Enum.frequencies()
  end

  defp sum_values({:ok, map1}, map2) do
    Map.merge(map1, map2, fn _key, value1, value2 ->
      value1 + value2
    end)
  end
end
