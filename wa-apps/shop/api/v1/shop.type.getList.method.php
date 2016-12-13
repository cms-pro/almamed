<?php

class shopTypeGetListMethod extends shopApiMethod
{
    protected $method = 'GET';

    public function execute()
    {
        $type_model = new shopTypeModel();
        $types = $type_model->getTypes();
        $this->response = array_values($types);
        $this->response['_element'] = 'type';
    }
}
