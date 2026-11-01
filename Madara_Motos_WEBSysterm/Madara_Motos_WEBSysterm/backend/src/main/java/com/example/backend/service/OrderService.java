package com.example.backend.service;

import com.example.backend.dto.OrderRequest;
import com.example.backend.dto.OrderItemRequest;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.SparePart;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.SparePartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final SparePartRepository sparePartRepository;

    public OrderService(OrderRepository orderRepository, SparePartRepository sparePartRepository) {
        this.orderRepository = orderRepository;
        this.sparePartRepository = sparePartRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequest request) {

        Order order = new Order();
        order.setCustomerName(request.getFirstName() + " " + request.getLastName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setContactNumber(request.getPhone());
        order.setAddress(request.getAddress());
        order.setCity(request.getCity());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING"); // Default status

        List<OrderItem> orderItems = new ArrayList<>();
        double calculatedTotal = 0;
        if (request.getItems() != null) {
            for (OrderItemRequest itemReq : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setProductCode(itemReq.getProductCode());
                item.setProductName(itemReq.getProductName());
                item.setPrice(itemReq.getPrice());
                item.setQuantity(itemReq.getQuantity());
                item.setOrder(order);

                calculatedTotal += itemReq.getPrice() * itemReq.getQuantity();
                orderItems.add(item);
                SparePart sparePart = sparePartRepository.findByProductCode(itemReq.getProductCode());

                if (sparePart != null) {
                    if (sparePart.getStockQty() < itemReq.getQuantity()) {
                        throw new RuntimeException("Insufficient stock for product: " +
                                itemReq.getProductName() + " (Available: " + sparePart.getStockQty() + ")");
                    }

                }
            }
        }

        order.setItems(orderItems);
        order.setTotalAmount(calculatedTotal);

        return orderRepository.save(order);
    }
}